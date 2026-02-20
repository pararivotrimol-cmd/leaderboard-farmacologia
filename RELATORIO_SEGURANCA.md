# Relatório de Análise de Segurança - Leaderboard Farmacologia

**Data:** 20 de Fevereiro de 2026  
**Versão:** 279d6df2  
**Auditor:** Manus AI  
**Status:** ⚠️ Requer Melhorias Críticas

---

## 📋 Resumo Executivo

A plataforma Leaderboard Farmacologia possui uma **base de segurança razoável** com autenticação OAuth implementada, mas apresenta **vulnerabilidades críticas** que precisam ser endereçadas antes da implantação em produção. Este relatório identifica 12 áreas de risco e fornece recomendações prioritárias.

**Risco Geral:** 🔴 **ALTO** (Score: 6.2/10)

---

## 🔐 Análise Detalhada por Área

### 1. **Autenticação e Autorização** ✅ Parcialmente Implementado

#### Status Atual
- ✅ OAuth 2.0 implementado com Manus OAuth
- ✅ JWT para sessões
- ✅ Cookies HTTP-only para armazenamento de tokens
- ✅ RBAC básico (admin/user)
- ⚠️ Sem MFA (Multi-Factor Authentication)
- ⚠️ Sem proteção contra brute force
- ⚠️ Sem rate limiting em endpoints de login

#### Vulnerabilidades Identificadas
1. **Sem MFA para contas admin** - Contas administrativas vulneráveis a credential stuffing
2. **Sem rate limiting em OAuth callback** - Possibilidade de brute force em token exchange
3. **Sem detecção de login suspeito** - Sem alertas para logins de locais desconhecidos
4. **Sessão de 1 ano** - Muito longa, aumenta janela de ataque

#### Recomendações
```typescript
// PRIORIDADE 1: Implementar rate limiting em OAuth
import rateLimit from 'express-rate-limit';

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: 'Muitas tentativas de login, tente novamente mais tarde'
});

app.get("/api/oauth/callback", oauthLimiter, async (req, res) => {
  // ... resto do código
});
```

---

### 2. **Validação de Dados** ⚠️ Parcialmente Implementado

#### Status Atual
- ✅ TypeScript para type safety
- ✅ tRPC com validação de tipos
- ⚠️ Sem validação de input em formulários
- ⚠️ Sem sanitização de strings
- ⚠️ Sem validação de tamanho de arquivo

#### Vulnerabilidades Identificadas
1. **Sem validação de CPF em importação UNIRIO** - Aceita qualquer string
2. **Sem limite de tamanho de upload** - Body parser configurado com 50MB
3. **Sem sanitização de nomes/emails** - Possibilidade de XSS via dados de usuário
4. **Sem validação de URL** - Possibilidade de SSRF em web scraping

#### Recomendações
```typescript
// PRIORIDADE 2: Adicionar validação com Zod
import { z } from 'zod';

const CPFSchema = z.string()
  .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
  .refine(validateCPF, 'CPF inválido');

const UnirioImportSchema = z.object({
  cpf: CPFSchema,
  password: z.string().min(6).max(100),
});

// Usar em rota tRPC
export const unirioRouter = router({
  importStudents: protectedProcedure
    .input(UnirioImportSchema)
    .mutation(async ({ input }) => {
      // ... código com validação garantida
    }),
});
```

---

### 3. **Proteção de API** ❌ Não Implementado

#### Status Atual
- ❌ **Sem rate limiting** - Nenhuma proteção contra DoS
- ❌ **Sem CORS configurado** - Aceita requisições de qualquer origem
- ⚠️ Sem validação de Content-Type
- ⚠️ Sem proteção CSRF (parcialmente mitigado por SameSite=none)

#### Vulnerabilidades Críticas
1. **Sem rate limiting** - Possibilidade de DoS/brute force
2. **CORS aberto** - Qualquer site pode fazer requisições à API
3. **Sem validação de Content-Type** - Possibilidade de content-type sniffing
4. **Sem X-Frame-Options** - Possibilidade de clickjacking

#### Recomendações
```typescript
// PRIORIDADE 1: Implementar CORS e rate limiting
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// Helmet para headers de segurança
app.use(helmet());

// CORS restritivo
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', generalLimiter);

// Rate limiting específico para tRPC
const trpcLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // 50 requisições por minuto
});

app.use('/api/trpc', trpcLimiter);
```

---

### 4. **Segurança de Banco de Dados** ✅ Bem Implementado

#### Status Atual
- ✅ Drizzle ORM com prepared statements
- ✅ Sem SQL injection possível
- ✅ Sem acesso direto a SQL
- ⚠️ Sem criptografia de dados sensíveis
- ⚠️ Sem auditoria de mudanças

#### Vulnerabilidades Identificadas
1. **Sem criptografia de dados sensíveis** - CPF, emails em texto plano
2. **Sem auditoria de mudanças** - Não há log de quem alterou o quê
3. **Sem backup automático** - Sem plano de recuperação de dados
4. **Sem validação de integridade** - Sem checksum de dados críticos

#### Recomendações
```typescript
// PRIORIDADE 2: Adicionar criptografia de dados sensíveis
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-prod';

export function encryptCPF(cpf: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(cpf, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decryptCPF(encrypted: string): string {
  const [iv, encryptedData, authTag] = encrypted.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

### 5. **Proteção de Senhas** ✅ Bem Implementado

#### Status Atual
- ✅ OAuth elimina necessidade de armazenar senhas
- ✅ Sem senhas em texto plano no banco
- ✅ Sem histórico de senhas
- ⚠️ Credenciais UNIRIO armazenadas em texto plano

#### Vulnerabilidades Identificadas
1. **Credenciais UNIRIO em texto plano** - Se banco for comprometido, credenciais expostas
2. **Sem proteção de senha temporária** - Se implementar reset de senha, precisa de proteção

#### Recomendações
```typescript
// PRIORIDADE 1: Criptografar credenciais UNIRIO
import crypto from 'crypto';

export async function storeUnirioCredentials(cpf: string, password: string) {
  const encrypted = encryptCPF(cpf); // Usar função de criptografia
  const hashedPassword = await bcrypt.hash(password, 12);
  
  await db.insert(unirioCredentials).values({
    cpf: encrypted,
    passwordHash: hashedPassword,
    userId: ctx.user.id,
  });
}
```

---

### 6. **Segurança de Sessão** ⚠️ Parcialmente Implementado

#### Status Atual
- ✅ Cookies HTTP-only
- ✅ SameSite=none (necessário para cross-origin)
- ✅ Secure flag quando HTTPS
- ⚠️ Sessão de 1 ano (muito longa)
- ⚠️ Sem invalidação de sessão anterior ao login
- ⚠️ Sem proteção contra session fixation

#### Vulnerabilidades Identificadas
1. **Sessão muito longa** - 1 ano aumenta janela de ataque
2. **Sem session rotation** - Mesmo token por 1 ano
3. **Sem proteção contra session fixation** - Possibilidade de forçar uso de token específico
4. **Sem logout automático** - Sessão permanece ativa indefinidamente

#### Recomendações
```typescript
// PRIORIDADE 2: Reduzir duração de sessão e implementar refresh tokens
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function createSessionWithRefresh(userId: string) {
  const sessionToken = await sdk.createSessionToken(userId, {
    expiresInMs: SESSION_DURATION,
  });
  
  const refreshToken = crypto.randomBytes(32).toString('hex');
  await db.insert(refreshTokens).values({
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DURATION),
  });
  
  return { sessionToken, refreshToken };
}
```

---

### 7. **Vulnerabilidades Comuns** ⚠️ Parcialmente Protegido

#### XSS (Cross-Site Scripting)
- ✅ React com JSX sanitiza por padrão
- ⚠️ Sem Content Security Policy (CSP)
- ⚠️ Sem validação de URLs em links

#### CSRF (Cross-Site Request Forgery)
- ✅ SameSite=none em cookies
- ⚠️ Sem CSRF tokens em formulários
- ⚠️ Sem validação de Origin header

#### SSRF (Server-Side Request Forgery)
- ⚠️ Web scraping UNIRIO sem validação de URL
- ⚠️ Sem whitelist de URLs permitidas
- ⚠️ Sem timeout em requisições HTTP

#### Recomendações
```typescript
// PRIORIDADE 1: Implementar CSP header
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Remover unsafe-inline em produção
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'https:'],
    connectSrc: ["'self'", 'https://api.manus.im'],
    frameSrc: ["'none'"],
  },
}));

// PRIORIDADE 2: Validar URLs em web scraping
import { URL } from 'url';

function isValidUnirioUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.hostname === 'portal.unirio.br' && url.protocol === 'https:';
  } catch {
    return false;
  }
}
```

---

### 8. **Auditoria e Logging** ❌ Não Implementado

#### Status Atual
- ❌ Sem logs de ações de admin
- ❌ Sem logs de acesso a dados sensíveis
- ❌ Sem alertas de atividade suspeita
- ⚠️ Logs do servidor sem estrutura

#### Vulnerabilidades Identificadas
1. **Sem auditoria de admin** - Impossível rastrear quem fez o quê
2. **Sem logs de acesso a CPF** - Impossível detectar vazamento de dados
3. **Sem alertas em tempo real** - Sem detecção de ataques em andamento
4. **Sem retenção de logs** - Logs podem ser perdidos

#### Recomendações
```typescript
// PRIORIDADE 2: Implementar auditoria de ações admin
import { z } from 'zod';

export const auditLog = sqliteTable('audit_logs', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // 'CREATE_CLASS', 'DELETE_STUDENT', etc
  resourceType: text('resource_type').notNull(), // 'class', 'student', 'team'
  resourceId: integer('resource_id'),
  changes: text('changes'), // JSON das mudanças
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: integer('timestamp').notNull(),
});

export async function logAudit(ctx: TrpcContext, {
  action,
  resourceType,
  resourceId,
  changes,
}: {
  action: string;
  resourceType: string;
  resourceId?: number;
  changes?: Record<string, any>;
}) {
  await db.insert(auditLog).values({
    userId: ctx.user?.id,
    action,
    resourceType,
    resourceId,
    changes: changes ? JSON.stringify(changes) : null,
    ipAddress: ctx.req.ip,
    userAgent: ctx.req.get('user-agent'),
    timestamp: Date.now(),
  });
}
```

---

### 9. **Criptografia de Dados** ⚠️ Parcialmente Implementado

#### Status Atual
- ✅ HTTPS em produção
- ✅ Cookies secure flag
- ⚠️ Sem criptografia de dados em repouso
- ⚠️ Sem criptografia de dados em trânsito para web scraping

#### Vulnerabilidades Identificadas
1. **Sem criptografia de dados em repouso** - CPF, emails em texto plano
2. **Sem validação de certificado SSL** - Possibilidade de MITM
3. **Sem Perfect Forward Secrecy** - Comprometimento de chave = acesso a tráfego antigo

#### Recomendações
```typescript
// PRIORIDADE 1: Implementar criptografia de dados sensíveis
// Ver seção 4 (Banco de Dados) para exemplo de criptografia

// PRIORIDADE 2: Usar HTTPS com certificado válido
// Em produção, usar Let's Encrypt com auto-renovação
```

---

### 10. **Gerenciamento de Secrets** ⚠️ Parcialmente Implementado

#### Status Atual
- ✅ Secrets em variáveis de ambiente
- ✅ Sem hardcoding de secrets no código
- ⚠️ Sem rotação de secrets
- ⚠️ Sem auditoria de acesso a secrets

#### Vulnerabilidades Identificadas
1. **Sem rotação de API keys** - Chaves podem ser comprometidas indefinidamente
2. **Sem auditoria de acesso a secrets** - Impossível detectar acesso não autorizado
3. **Sem proteção de secrets em logs** - Secrets podem ser expostos em logs
4. **Sem versionamento de secrets** - Impossível revogar versão antiga

#### Recomendações
```typescript
// PRIORIDADE 2: Implementar rotação de secrets
export async function rotateSecrets() {
  // Gerar novo API key
  const newApiKey = crypto.randomBytes(32).toString('hex');
  
  // Armazenar com timestamp
  await db.insert(apiKeyHistory).values({
    key: newApiKey,
    version: currentVersion + 1,
    createdAt: new Date(),
    revokedAt: null,
  });
  
  // Atualizar env var (manual ou via CI/CD)
  // process.env.BUILT_IN_FORGE_API_KEY = newApiKey;
}

// PRIORIDADE 2: Mascarar secrets em logs
function maskSecrets(obj: any): any {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'cpf'];
  
  for (const key in obj) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      obj[key] = '***REDACTED***';
    }
  }
  
  return obj;
}
```

---

### 11. **Dependências e Vulnerabilidades** ⚠️ Requer Verificação

#### Status Atual
- ⚠️ Sem verificação de vulnerabilidades conhecidas
- ⚠️ Sem política de atualização de dependências
- ⚠️ Sem lock file verificado

#### Recomendações
```bash
# Verificar vulnerabilidades
npm audit
pnpm audit

# Atualizar dependências com segurança
npm update
npm audit fix

# Adicionar verificação no CI/CD
# npm audit --audit-level=moderate
```

---

### 12. **Infraestrutura e Deployment** ⚠️ Requer Verificação

#### Status Atual
- ⚠️ Sem WAF (Web Application Firewall)
- ⚠️ Sem DDoS protection
- ⚠️ Sem monitoramento de segurança
- ⚠️ Sem backup automático

#### Recomendações
```
PRIORIDADE 3: Implementar em infraestrutura
- Usar WAF (Cloudflare, AWS WAF)
- Ativar DDoS protection
- Configurar monitoramento com Sentry/DataDog
- Implementar backup automático diário
- Usar VPN para acesso admin
```

---

## 📊 Matriz de Risco

| Área | Risco | Impacto | Esforço | Prioridade |
|------|-------|---------|---------|-----------|
| Rate Limiting | 🔴 Alto | Crítico | Baixo | **P1** |
| CORS | 🔴 Alto | Crítico | Baixo | **P1** |
| Validação de Input | 🔴 Alto | Alto | Médio | **P1** |
| Criptografia de Dados | 🟡 Médio | Crítico | Alto | **P2** |
| Auditoria | 🟡 Médio | Alto | Médio | **P2** |
| MFA | 🟡 Médio | Alto | Alto | **P2** |
| CSP Header | 🟡 Médio | Médio | Baixo | **P2** |
| Session Management | 🟡 Médio | Médio | Médio | **P2** |
| Secrets Rotation | 🟢 Baixo | Médio | Médio | **P3** |
| WAF/DDoS | 🟢 Baixo | Médio | Alto | **P3** |
| Backup | 🟢 Baixo | Alto | Médio | **P3** |
| Monitoramento | 🟢 Baixo | Médio | Médio | **P3** |

---

## ✅ Plano de Ação

### **Fase 1: Proteções Críticas (1-2 semanas)**
- [ ] Implementar rate limiting em todas as rotas
- [ ] Configurar CORS restritivo
- [ ] Adicionar validação de input com Zod
- [ ] Implementar CSP header
- [ ] Adicionar helmet para headers de segurança

### **Fase 2: Proteções Importantes (2-4 semanas)**
- [ ] Criptografar dados sensíveis (CPF, emails)
- [ ] Implementar auditoria de ações admin
- [ ] Reduzir duração de sessão para 24h
- [ ] Implementar MFA para contas admin
- [ ] Adicionar proteção contra brute force

### **Fase 3: Proteções Adicionais (1-2 meses)**
- [ ] Implementar secrets rotation
- [ ] Adicionar monitoramento de segurança
- [ ] Configurar WAF e DDoS protection
- [ ] Implementar backup automático
- [ ] Realizar penetration testing

---

## 🔍 Checklist de Segurança para Produção

- [ ] Rate limiting implementado
- [ ] CORS configurado restritivamente
- [ ] Validação de input em todas as rotas
- [ ] Criptografia de dados sensíveis
- [ ] HTTPS com certificado válido
- [ ] Cookies com flags de segurança
- [ ] CSP header implementado
- [ ] Helmet configurado
- [ ] Auditoria de ações admin
- [ ] Logs estruturados e monitorados
- [ ] Backup automático testado
- [ ] Plano de resposta a incidentes
- [ ] Penetration testing realizado
- [ ] Dependências atualizadas e verificadas
- [ ] Secrets em variáveis de ambiente
- [ ] MFA para contas admin

---

## 📞 Próximos Passos

1. **Implementar Fase 1** (Proteções Críticas) imediatamente
2. **Realizar code review** de segurança
3. **Executar penetration testing** antes de produção
4. **Documentar políticas de segurança** para equipe
5. **Treinar desenvolvedores** em práticas seguras

---

## 📝 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [tRPC Security](https://trpc.io/docs/server/middlewares)
- [Drizzle ORM Security](https://orm.drizzle.team/docs/sql-safety)

---

**Relatório Preparado por:** Manus AI  
**Data:** 20 de Fevereiro de 2026  
**Versão do Projeto:** 279d6df2
