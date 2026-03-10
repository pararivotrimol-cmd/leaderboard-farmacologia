import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeWebSocket } from "./websocket";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust Railway's proxy so rate limiter uses real client IPs (X-Forwarded-For)
  app.set('trust proxy', 1);
  
  initializeWebSocket(server);
  
  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "https:", "data:", "blob:"],
        connectSrc: ["'self'", "https://files.manuscdn.com", "https://api.manus.im", "wss:", "ws:"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        mediaSrc: ["'self'", "https://files.manuscdn.com", "blob:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow the production domain
      if (origin.includes('conexaofarmacologia.com.br')) return callback(null, true);
      // Allow any manus.space or manus.computer domain
      if (origin.endsWith('.manus.space') || origin.endsWith('.manus.computer') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow localhost in development
      if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  // Rate limiting — usando IP real via X-Forwarded-For (trust proxy ativado acima)
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window per IP
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas requisições, tente novamente mais tarde' });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window per IP
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas tentativas de login, tente novamente mais tarde' });
    },
    skipSuccessfulRequests: true,
  });
  
  // tRPC limiter: 500 req/min por IP — suporta turmas grandes fazendo check-in simultâneo
  const trpcLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500, // 500 requests per minute per IP
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas requisições à API, tente novamente mais tarde' });
    },
  });
  
  // Limiter específico para check-in de QR Code — mais permissivo para suportar turmas grandes
  const qrCheckInLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // 200 check-ins por IP por 5 minutos
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas tentativas de check-in. Aguarde alguns minutos.' });
    },
    skip: (req) => !req.path.includes('qrcode.checkIn'),
  });
  
  // Apply rate limiters
  app.use('/api/', generalLimiter);
  app.use('/api/trpc', trpcLimiter);
  app.use('/api/trpc/qrcode.checkIn', qrCheckInLimiter);
  app.use('/api/oauth/callback', authLimiter);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback (rate limited above)
  registerOAuthRoutes(app);
  // tRPC API (rate limited above)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log('[Security] Helmet enabled');
    console.log('[Security] CORS configured');
    console.log('[Security] Rate limiting enabled');
    console.log('[WebSocket] Real-time notifications enabled');
    
    // Auto-migração: adicionar colunas de geolocalização se não existirem
    try {
      const { getRawDb } = await import("../db");
      const rawDb = await getRawDb();
      if (rawDb) {
        const geoMigrations = [
          "ALTER TABLE qrCodeSessions ADD COLUMN geoLatitude DECIMAL(10,7) DEFAULT NULL",
          "ALTER TABLE qrCodeSessions ADD COLUMN geoLongitude DECIMAL(10,7) DEFAULT NULL",
          "ALTER TABLE qrCodeSessions ADD COLUMN geoRadiusMeters INT NOT NULL DEFAULT 150",
          "ALTER TABLE qrCodeSessions ADD COLUMN geoValidationEnabled BOOLEAN NOT NULL DEFAULT TRUE",
          "ALTER TABLE attendanceRecords ADD COLUMN latitude DECIMAL(10,7) DEFAULT NULL",
          "ALTER TABLE attendanceRecords ADD COLUMN longitude DECIMAL(10,7) DEFAULT NULL",
          "ALTER TABLE attendanceRecords ADD COLUMN distanceMeters DECIMAL(8,2) DEFAULT NULL",
          "ALTER TABLE attendanceRecords ADD COLUMN geoStatus ENUM('valid','invalid','no_gps','disabled') DEFAULT 'no_gps'",
          "ALTER TABLE studentAccounts ADD COLUMN gender ENUM('male','female') DEFAULT 'male'",
        ];
        for (const sql of geoMigrations) {
          try {
            await rawDb.execute(sql);
            console.log(`[Migration] OK: ${sql.substring(0, 60)}...`);
          } catch (err: any) {
            if (err?.code === 'ER_DUP_FIELDNAME' || err?.message?.includes('Duplicate column')) {
              // Coluna já existe, ignorar
            } else {
              console.warn(`[Migration] Warn: ${err?.message?.substring(0, 80)}`);
            }
          }
        }
        console.log('[Migration] Geo columns migration check complete');
        
        // Migração: criar tabela groupActivityGrades se não existir
        try {
          await rawDb.execute(`
            CREATE TABLE IF NOT EXISTS groupActivityGrades (
              id INT AUTO_INCREMENT PRIMARY KEY,
              classId INT NOT NULL,
              activityType ENUM('kahoot', 'clinical_case') NOT NULL,
              activityName VARCHAR(200) NOT NULL,
              homeGroupId INT DEFAULT NULL,
              groupName VARCHAR(200) NOT NULL,
              grade DECIMAL(5,2) NOT NULL DEFAULT 0,
              maxGrade DECIMAL(5,2) NOT NULL DEFAULT 10,
              notes TEXT,
              launchedByMonitorId INT DEFAULT NULL,
              launchedByName VARCHAR(200) DEFAULT NULL,
              createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `);
          console.log('[Migration] OK: groupActivityGrades table created/verified');
        } catch (err: any) {
          console.warn('[Migration] groupActivityGrades:', err?.message?.substring(0, 80));
        }

        // Migração: adicionar assignedClassId em studentAccounts (para monitores)
        try {
          await rawDb.execute(`ALTER TABLE studentAccounts ADD COLUMN assignedClassId INT DEFAULT NULL`);
          console.log('[Migration] OK: assignedClassId added to studentAccounts');
        } catch (err: any) {
          if (!err?.message?.includes('Duplicate column') && err?.code !== 'ER_DUP_FIELDNAME') {
            console.warn('[Migration] assignedClassId:', err?.message?.substring(0, 80));
          }
        }
      }
    } catch (err) {
      console.warn('[Migration] Could not run geo migration:', err);
    }
  });
}

// Ensure ALLOWED_ORIGINS is set in production
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.warn('[WARNING] ALLOWED_ORIGINS not set in production. CORS may not work correctly.');
}

startServer().catch(console.error);
