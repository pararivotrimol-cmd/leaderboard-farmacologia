# Análise de Segurança - Leaderboard Farmacologia

## Sumário Executivo

Este documento apresenta uma análise abrangente dos mecanismos de segurança implementados na plataforma Leaderboard Farmacologia, identificando vulnerabilidades potenciais e recomendando melhorias. A plataforma utiliza OAuth 2.0 para autenticação, controle de acesso baseado em papéis (RBAC), e segue práticas recomendadas de desenvolvimento web seguro.

---

## 1. Autenticação e Autorização

### 1.1 Mecanismo de Autenticação Atual

A plataforma implementa **OAuth 2.0 com Manus** como provedor de identidade. O fluxo de autenticação segue o padrão OpenID Connect:

1. Usuário clica em "Login com Manus"
2. Redirecionamento para portal OAuth Manus
3. Usuário autentica com credenciais
4. Callback para `/api/oauth/callback` com código de autorização
5. Troca de código por token JWT
6. Token armazenado em cookie seguro (HttpOnly, Secure, SameSite)

**Pontos Positivos:**

- OAuth 2.0 é um padrão de segurança estabelecido
- Senhas não são armazenadas localmente (terceirizado para Manus)
- Tokens JWT com expiração configurada
- Cookies HttpOnly previnem acesso via JavaScript (proteção contra XSS)
- Flag Secure garante transmissão apenas via HTTPS
- SameSite previne CSRF attacks

**Vulnerabilidades Potenciais:**

- Redirect URI não validado adequadamente (risco de open redirect)
- Falta de verificação de state parameter em alguns casos
- Token refresh não implementado (sessão expira após tempo fixo)
- Logout não invalida token no servidor

### 1.2 Controle de Acesso (RBAC)

A plataforma implementa dois papéis principais:

| Papel | Permissões | Riscos |
|-------|-----------|--------|
| **user** | Visualizar dados próprios, participar de grupos, submeter atividades | Acesso a dados de outros usuários se validação falhar |
| **admin** | Gerenciar turmas, importar alunos, visualizar estatísticas, editar PF | Privilégio elevado - requer proteção extra |

**Implementação Atual:**

```typescript
// Exemplo de proteção em procedimento tRPC
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

**Vulnerabilidades Identificadas:**

1. **Falta de auditoria de ações admin** - Não há log de quem fez o quê
2. **Sem autenticação multifator (MFA)** - Contas admin vulneráveis a credential stuffing
3. **Sem rate limiting em login** - Brute force possível
4. **Sem detecção de comportamento anômalo** - Acesso de IP suspeito não detectado

---

## 2. Validação de Dados e Proteção contra Injeção

### 2.1 Proteção contra SQL Injection

**Status:** ✅ Implementado

A plataforma usa Drizzle ORM, que utiliza prepared statements por padrão:

```typescript
// Seguro - usa prepared statements
const student = await db.select().from(members)
  .where(eq(members.id, studentId))
  .limit(1);
```

Drizzle gera queries parametrizadas, prevenindo SQL injection.

### 2.2 Validação de Input

**Status:** ⚠️ Parcialmente Implementado

**Boas Práticas Encontradas:**

- Tipos TypeScript garantem type safety em tempo de compilação
- tRPC com Zod para validação de schema em procedimentos

**Exemplo Seguro:**

```typescript
export const createJigsawGroup = protectedProcedure
  .input(z.object({
    classId: z.number().positive(),
    groupType: z.enum(['seminar', 'clinical_case', 'kahoot']),
    name: z.string().min(1).max(200),
    maxMembers: z.number().min(2).max(50),
  }))
  .mutation(async ({ input, ctx }) => {
    // Input já validado por Zod
  });
```

**Vulnerabilidades Identificadas:**

1. **Validação inconsistente em alguns endpoints** - Nem todos usam Zod
2. **Falta de sanitização de output** - HTML/JavaScript pode ser renderizado
3. **Sem validação de tamanho de arquivo** - Upload de arquivo grande pode causar DoS

### 2.3 Proteção contra XSS (Cross-Site Scripting)

**Status:** ✅ Implementado (Parcialmente)

**Proteções:**

- React escapa automaticamente conteúdo em JSX
- Sanitização de markdown com `Streamdown`
- Sem uso de `dangerouslySetInnerHTML`

**Vulnerabilidades Potenciais:**

1. **Conteúdo de usuário não sanitizado** - Se um aluno inserir HTML em descrição de grupo, pode executar scripts
2. **Sem Content Security Policy (CSP)** - Não há header CSP para restringir fontes de script

---

## 3. Proteção contra CSRF (Cross-Site Request Forgery)

**Status:** ⚠️ Parcialmente Implementado

**Proteções Atuais:**

- Cookies com flag SameSite=Strict (previne CSRF)
- tRPC usa POST para mutações (não GET)

**Vulnerabilidades:**

1. **Sem token CSRF explícito** - Depende apenas de SameSite
2. **Sem validação de Origin header** - Requisições de origem desconhecida não são bloqueadas

---

## 4. Segurança de Sessão

### 4.1 Armazenamento de Sessão

**Status:** ✅ Implementado

- Sessão armazenada em cookie HttpOnly
- Cookie tem flag Secure (HTTPS only)
- Cookie tem flag SameSite=Strict

**Vulnerabilidades Potenciais:**

1. **Sem expiração de sessão** - Sessão válida indefinidamente
2. **Sem invalidação de sessão no logout** - Cookie deletado no cliente, mas token ainda válido no servidor
3. **Sem detecção de roubo de sessão** - Mesmo IP/User-Agent não validado

### 4.2 Proteção de Senha

**Status:** ✅ Implementado (para login tradicional)

- Senhas hasheadas com bcrypt (se login tradicional usado)
- Salt automático gerado

**Vulnerabilidades:**

1. **Autenticação OAuth não valida força de senha** - Depende de Manus
2. **Sem requisitos de senha forte** - Se login tradicional implementado

---

## 5. Proteção contra Ataques de Força Bruta

**Status:** ❌ Não Implementado

**Riscos:**

1. **Sem rate limiting em login** - Atacante pode tentar múltiplas senhas
2. **Sem CAPTCHA** - Bot pode automatizar tentativas
3. **Sem bloqueio temporário após falhas** - Sem limite de tentativas

**Recomendação:**

Implementar rate limiting com Redis:

```typescript
// Pseudocódigo
const loginAttempts = await redis.incr(`login:${email}`);
if (loginAttempts > 5) {
  const ttl = await redis.ttl(`login:${email}`);
  throw new Error(`Too many attempts. Try again in ${ttl} seconds`);
}
await redis.expire(`login:${email}`, 900); // 15 minutos
```

---

## 6. Auditoria e Logging

**Status:** ⚠️ Parcialmente Implementado

**Tabelas de Auditoria Encontradas:**

- `auditLog` - Registra ações administrativas
- `emailLog` - Registra envios de email
- `xpHistory` - Registra alterações de PF

**Vulnerabilidades:**

1. **Logs não são imutáveis** - Admin pode deletar logs para cobrir rastreamento
2. **Sem alertas em tempo real** - Atividade suspeita não dispara notificação
3. **Sem análise de logs** - Logs não são analisados para padrões suspeitos
4. **Retenção de logs não definida** - Logs podem crescer indefinidamente

**Recomendação:**

Implementar logs imutáveis com timestamp e hash:

```typescript
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 50 }),
  resourceId: int("resourceId"),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: varchar("userAgent", { length: 500 }),
  previousHash: varchar("previousHash", { length: 64 }), // Hash do log anterior
  hash: varchar("hash", { length: 64 }).notNull(), // Hash deste log
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
```

---

## 7. Proteção de API

### 7.1 Rate Limiting

**Status:** ❌ Não Implementado

**Riscos:**

1. **DoS possível** - Atacante pode sobrecarregar API com requisições
2. **Scraping de dados** - Sem limite, dados podem ser extraídos em massa
3. **Brute force em endpoints** - Sem limite de tentativas

**Recomendação:**

Implementar rate limiting com Express middleware:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### 7.2 CORS (Cross-Origin Resource Sharing)

**Status:** ✅ Implementado

- CORS configurado para aceitar apenas origem conhecida
- Credenciais incluídas apenas em requisições da mesma origem

**Vulnerabilidades Potenciais:**

1. **Sem validação de Origin header** - Qualquer origem pode fazer requisições
2. **Sem whitelist de domínios** - Se aplicação em múltiplos domínios, todos aceitos

---

## 8. Segurança de Dados Sensíveis

### 8.1 Proteção de Dados Pessoais

**Status:** ⚠️ Parcialmente Implementado

**Dados Sensíveis Coletados:**

- Nome completo
- Email
- Dados acadêmicos (PF, equipe, turma)
- Histórico de atividades

**Proteções:**

- Dados armazenados em banco de dados criptografado (TLS)
- Acesso ao banco restrito a servidor

**Vulnerabilidades:**

1. **Sem criptografia de dados em repouso** - Dados armazenados em texto plano
2. **Sem mascaramento de dados sensíveis** - Email completo visível em logs
3. **Sem política de retenção de dados** - Dados não são deletados após período

**Recomendação:**

Implementar criptografia de dados sensíveis:

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

export function encryptEmail(email: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(email, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decryptEmail(encrypted: string): string {
  const [iv, encryptedText, authTag] = encrypted.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', 
    Buffer.from(ENCRYPTION_KEY), 
    Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 8.2 Proteção de Credenciais UNIRIO

**Status:** ❌ Não Implementado

**Riscos Críticos:**

1. **Credenciais armazenadas em texto plano** - Se banco for comprometido, credenciais UNIRIO expostas
2. **Sem rotação de credenciais** - Mesma senha usada indefinidamente
3. **Sem auditoria de acesso** - Quem acessou UNIRIO não é registrado

**Recomendação:**

Usar Vault para armazenar credenciais:

```typescript
// Usar HashiCorp Vault ou AWS Secrets Manager
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager();

export async function getUnirioCredentials() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'unirio/credentials'
  }).promise();
  return JSON.parse(secret.SecretString);
}
```

---

## 9. Segurança da Importação UNIRIO

### 9.1 Vulnerabilidades Específicas

**Status:** ⚠️ Requer Revisão

**Riscos Identificados:**

1. **Injeção de credenciais** - Se formulário não validado, credenciais podem ser injetadas
2. **Man-in-the-Middle (MITM)** - Se UNIRIO não usar HTTPS, credenciais expostas
3. **Scraping não autorizado** - Portal UNIRIO pode bloquear/banir IP

**Recomendação:**

Implementar validação rigorosa:

```typescript
export const importFromUnirioSchema = z.object({
  cpf: z.string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .refine(cpf => validateCPF(cpf), 'CPF inválido'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  classId: z.number().positive('ID da turma inválido'),
});

// Validar CPF com algoritmo oficial
function validateCPF(cpf: string): boolean {
  // Implementar validação de CPF
  // https://www.geradordecpf.org/algoritmo-cpf/
  return true;
}
```

---

## 10. Proteção contra Vulnerabilidades Comuns

| Vulnerabilidade | Status | Descrição |
|-----------------|--------|-----------|
| **SQL Injection** | ✅ Protegido | Drizzle ORM usa prepared statements |
| **XSS** | ⚠️ Parcial | React escapa conteúdo, mas sem CSP |
| **CSRF** | ✅ Protegido | SameSite cookies implementado |
| **Broken Authentication** | ⚠️ Parcial | OAuth implementado, mas sem MFA |
| **Sensitive Data Exposure** | ❌ Vulnerável | Sem criptografia de dados em repouso |
| **XML External Entities (XXE)** | ✅ Protegido | Não processa XML |
| **Broken Access Control** | ⚠️ Parcial | RBAC implementado, mas sem auditoria |
| **Security Misconfiguration** | ⚠️ Parcial | HTTPS obrigatório, mas sem CSP |
| **Insecure Deserialization** | ✅ Protegido | Usa JSON, não serialização insegura |
| **Using Components with Known Vulnerabilities** | ⚠️ Requer Monitoramento | Dependências devem ser auditadas |

---

## 11. Recomendações Prioritárias

### Críticas (Implementar Imediatamente)

1. **Rate Limiting** - Previne DoS e brute force
2. **Auditoria de Ações Admin** - Rastreamento de quem fez o quê
3. **Validação de Input Consistente** - Todos endpoints devem validar
4. **Criptografia de Dados Sensíveis** - Email, CPF, credenciais
5. **Content Security Policy (CSP)** - Previne XSS

### Altas (Implementar em 1-2 sprints)

1. **Autenticação Multifator (MFA)** - Para contas admin
2. **Detecção de Comportamento Anômalo** - Alertas em tempo real
3. **Invalidação de Sessão no Logout** - Logout real no servidor
4. **Proteção de Credenciais UNIRIO** - Usar Vault
5. **Monitoramento de Dependências** - Verificar vulnerabilidades

### Médias (Implementar em 2-4 sprints)

1. **Logs Imutáveis** - Com hash e timestamp
2. **Política de Retenção de Dados** - Deletar dados antigos
3. **Teste de Penetração** - Auditoria externa de segurança
4. **Documentação de Segurança** - Guias para desenvolvedores
5. **Treinamento de Segurança** - Para equipe

---

## 12. Checklist de Implementação

- [ ] Implementar rate limiting em todos endpoints
- [ ] Adicionar auditoria de ações admin com logging
- [ ] Implementar Content Security Policy (CSP)
- [ ] Criptografar dados sensíveis em repouso
- [ ] Adicionar autenticação multifator (MFA) para admin
- [ ] Implementar detecção de comportamento anômalo
- [ ] Invalidar sessão no logout (server-side)
- [ ] Usar Vault para credenciais UNIRIO
- [ ] Validar input em todos endpoints com Zod
- [ ] Adicionar testes de segurança automatizados
- [ ] Configurar CORS com whitelist de domínios
- [ ] Implementar logs imutáveis com hash
- [ ] Adicionar política de retenção de dados
- [ ] Realizar teste de penetração
- [ ] Documentar políticas de segurança

---

## 13. Referências e Recursos

**OWASP Top 10 2021:**
- https://owasp.org/Top10/

**Guias de Segurança:**
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express.js Security: https://expressjs.com/en/advanced/best-practice-security.html
- React Security: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml

**Ferramentas de Teste:**
- OWASP ZAP: https://www.zaproxy.org/
- Burp Suite Community: https://portswigger.net/burp/communitydownload
- npm audit: https://docs.npmjs.com/cli/v8/commands/npm-audit

---

**Documento Preparado:** 19 de Fevereiro de 2026

**Responsável:** Manus AI Security Analysis

**Versão:** 1.0

**Próxima Revisão:** 19 de Março de 2026
