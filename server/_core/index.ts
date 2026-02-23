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
  
  // Rate limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas requisições, tente novamente mais tarde' });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas tentativas de login, tente novamente mais tarde' });
    },
    skipSuccessfulRequests: true,
  });
  
  const trpcLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    handler: (_req, res) => {
      res.status(429).json({ error: 'Muitas requisições à API, tente novamente mais tarde' });
    },
  });
  
  // Apply rate limiters
  app.use('/api/', generalLimiter);
  app.use('/api/trpc', trpcLimiter);
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

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log('[Security] Helmet enabled');
    console.log('[Security] CORS configured');
    console.log('[Security] Rate limiting enabled');
  });
}

// Ensure ALLOWED_ORIGINS is set in production
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.warn('[WARNING] ALLOWED_ORIGINS not set in production. CORS may not work correctly.');
}

startServer().catch(console.error);
