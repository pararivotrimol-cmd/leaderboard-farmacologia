# Guia de Boas Práticas de Segurança para Desenvolvedores

**Leaderboard Farmacologia - Versão 1.0**

---

## 📌 Introdução

Este guia fornece diretrizes de segurança que todos os desenvolvedores devem seguir ao trabalhar na plataforma Leaderboard Farmacologia. A segurança é responsabilidade de todos e deve ser considerada em cada fase do desenvolvimento.

---

## 🔐 Princípios Fundamentais de Segurança

### 1. **Defesa em Profundidade**
Não confie em uma única camada de segurança. Implemente múltiplas camadas de proteção em todas as operações críticas.

### 2. **Princípio do Menor Privilégio**
Conceda apenas as permissões mínimas necessárias para realizar uma tarefa. Nunca use contas admin para operações rotineiras.

### 3. **Falha Segura**
Em caso de erro, o sistema deve falhar de forma segura, negando acesso por padrão.

### 4. **Validar Tudo**
Nunca confie em dados do usuário. Valide e sanitize todos os inputs, mesmo de fontes aparentemente confiáveis.

### 5. **Criptografar Dados Sensíveis**
Dados sensíveis (CPF, senhas, tokens) devem ser criptografados em repouso e em trânsito.

---

## 🛡️ Checklist de Segurança por Tipo de Tarefa

### Ao Adicionar Nova Rota tRPC

```typescript
// ❌ ERRADO
export const myRouter = router({
  deleteUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      // Qualquer um pode deletar qualquer usuário!
      await db.delete(users).where(eq(users.id, input.userId));
    }),
});

// ✅ CORRETO
export const myRouter = router({
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar permissões
      if (ctx.user.role !== 'admin' && ctx.user.id !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      // Validar que o usuário existe
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
      });
      
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      // Registrar auditoria
      await logAudit(ctx, {
        action: 'DELETE_USER',
        resourceType: 'user',
        resourceId: input.userId,
      });
      
      await db.delete(users).where(eq(users.id, input.userId));
    }),
});
```

**Checklist:**
- [ ] Usar `protectedProcedure` para operações sensíveis
- [ ] Validar permissões do usuário
- [ ] Validar que recurso existe antes de modificar
- [ ] Registrar ação em auditoria
- [ ] Usar `TRPCError` com códigos apropriados
- [ ] Validar input com Zod

### Ao Aceitar Dados do Usuário

```typescript
// ❌ ERRADO
const name = req.body.name; // Sem validação!
await db.insert(users).values({ name });

// ✅ CORRETO
import { z } from 'zod';

const UserNameSchema = z.string()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-Z\s'-]+$/, 'Nome contém caracteres inválidos');

const validatedName = UserNameSchema.parse(req.body.name);
await db.insert(users).values({ name: validatedName });
```

**Checklist:**
- [ ] Usar Zod para validação
- [ ] Definir limites de tamanho
- [ ] Validar formato (regex, email, etc)
- [ ] Rejeitar dados inválidos com mensagem clara
- [ ] Nunca usar dados não validados em queries

### Ao Armazenar Dados Sensíveis

```typescript
// ❌ ERRADO
await db.insert(credentials).values({
  cpf: userInput.cpf, // Em texto plano!
  password: userInput.password, // Em texto plano!
});

// ✅ CORRETO
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const encryptedCPF = encryptCPF(userInput.cpf);
const hashedPassword = await bcrypt.hash(userInput.password, 12);

await db.insert(credentials).values({
  cpf: encryptedCPF,
  passwordHash: hashedPassword,
});
```

**Checklist:**
- [ ] Criptografar CPF, emails, dados pessoais
- [ ] Usar bcrypt para senhas (nunca armazenar em texto plano)
- [ ] Usar chaves de criptografia de variáveis de ambiente
- [ ] Nunca logar dados sensíveis
- [ ] Usar salt adequado (bcrypt faz automaticamente)

### Ao Fazer Web Scraping

```typescript
// ❌ ERRADO
const response = await fetch(userProvidedUrl); // SSRF!

// ✅ CORRETO
import { URL } from 'url';

function isValidUnirioUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Whitelist de hosts permitidos
    const allowedHosts = ['portal.unirio.br'];
    if (!allowedHosts.includes(url.hostname)) {
      return false;
    }
    // Apenas HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

if (!isValidUnirioUrl(userProvidedUrl)) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'URL inválida' });
}

const response = await fetch(userProvidedUrl, {
  timeout: 5000, // Timeout de 5 segundos
});
```

**Checklist:**
- [ ] Validar URL com whitelist
- [ ] Usar apenas HTTPS
- [ ] Implementar timeout
- [ ] Limitar tamanho de resposta
- [ ] Não seguir redirects automáticos
- [ ] Registrar tentativas suspeitas

### Ao Implementar Autenticação

```typescript
// ❌ ERRADO
if (password === storedPassword) { // Comparação simples é vulnerável a timing attacks!
  // Login bem-sucedido
}

// ✅ CORRETO
import bcrypt from 'bcryptjs';

const passwordMatch = await bcrypt.compare(password, storedPasswordHash);
if (!passwordMatch) {
  // Não revelar se email ou senha está errado
  throw new TRPCError({ 
    code: 'UNAUTHORIZED', 
    message: 'Email ou senha inválidos' 
  });
}

// Registrar login bem-sucedido
await logAudit(ctx, {
  action: 'LOGIN_SUCCESS',
  resourceType: 'user',
  resourceId: user.id,
});
```

**Checklist:**
- [ ] Usar bcrypt para comparação de senhas
- [ ] Não revelar se email ou senha está errado
- [ ] Registrar tentativas de login
- [ ] Implementar rate limiting em login
- [ ] Usar HTTPS para transmissão de senhas
- [ ] Implementar MFA para contas admin

### Ao Lidar com Erros

```typescript
// ❌ ERRADO
catch (error) {
  res.status(500).json({ 
    error: error.message, // Pode expor informações sensíveis!
    stack: error.stack // Nunca enviar stack trace ao cliente!
  });
}

// ✅ CORRETO
catch (error) {
  console.error('[ERROR]', error); // Log completo no servidor
  
  // Resposta genérica ao cliente
  res.status(500).json({ 
    error: 'Erro interno do servidor' 
  });
  
  // Alertar se erro crítico
  if (isCriticalError(error)) {
    await notifySecurityTeam(error);
  }
}
```

**Checklist:**
- [ ] Nunca expor stack traces ao cliente
- [ ] Logar erros completos no servidor
- [ ] Usar mensagens genéricas para cliente
- [ ] Alertar sobre erros críticos
- [ ] Não revelar detalhes de implementação

---

## 🔒 Proteção de Dados Sensíveis

### Dados que Requerem Criptografia

| Dado | Tipo | Método |
|------|------|--------|
| CPF | PII | AES-256-GCM |
| Email | PII | AES-256-GCM |
| Senha | Credencial | bcrypt (12 rounds) |
| Token de Sessão | Autenticação | JWT com HMAC |
| Credenciais UNIRIO | Credencial | AES-256-GCM + bcrypt |

### Exemplo de Criptografia

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

export function encryptSensitiveData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Formato: iv:encrypted:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decryptSensitiveData(encrypted: string): string {
  const [iv, encryptedData, authTag] = encrypted.split(':');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 🚨 Sinais de Alerta - O Que Procurar

### Padrões Perigosos

1. **Sem Validação de Input**
   ```typescript
   // ❌ Perigoso
   const userId = req.query.id;
   ```

2. **Sem Verificação de Permissões**
   ```typescript
   // ❌ Perigoso
   await deleteUser(userId); // Qualquer um pode deletar?
   ```

3. **Dados Sensíveis em Logs**
   ```typescript
   // ❌ Perigoso
   console.log('User login:', { email, password });
   ```

4. **Sem Rate Limiting**
   ```typescript
   // ❌ Perigoso
   app.post('/api/login', async (req, res) => { ... });
   ```

5. **Sem Criptografia de Dados Sensíveis**
   ```typescript
   // ❌ Perigoso
   await db.insert(users).values({ cpf: userInput.cpf });
   ```

6. **SQL Injection (mesmo com ORM)**
   ```typescript
   // ❌ Perigoso
   const query = `SELECT * FROM users WHERE name = '${name}'`;
   ```

7. **XSS em React**
   ```typescript
   // ❌ Perigoso
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   ```

---

## 📋 Processo de Code Review de Segurança

Ao revisar código, verifique:

- [ ] Todas as rotas protegidas usam `protectedProcedure`?
- [ ] Permissões são verificadas para cada operação?
- [ ] Inputs são validados com Zod?
- [ ] Dados sensíveis são criptografados?
- [ ] Erros não expõem informações sensíveis?
- [ ] Rate limiting está implementado?
- [ ] Logs não contêm dados sensíveis?
- [ ] SQL injection é impossível (usando ORM)?
- [ ] XSS é impossível (React sanitiza)?
- [ ] CSRF é prevenido (SameSite cookies)?
- [ ] Auditoria registra ações importantes?
- [ ] Testes cobrem casos de erro?

---

## 🔄 Processo de Atualização de Dependências

Mantenha as dependências atualizadas para corrigir vulnerabilidades:

```bash
# Verificar vulnerabilidades
pnpm audit

# Atualizar dependências
pnpm update

# Corrigir automaticamente vulnerabilidades
pnpm audit fix

# Verificar novamente
pnpm audit
```

---

## 📞 Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança:

1. **NÃO** publique em issues públicas
2. Envie email para `security@example.com` com detalhes
3. Aguarde resposta dentro de 48 horas
4. Trabalhe com a equipe para corrigir

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [tRPC Security](https://trpc.io/docs/server/middlewares)
- [Drizzle ORM Security](https://orm.drizzle.team/docs/sql-safety)

---

## ✅ Checklist Final

Antes de fazer commit:

- [ ] Validei todos os inputs com Zod
- [ ] Verifiquei permissões para operações sensíveis
- [ ] Criptografei dados sensíveis
- [ ] Não exponho informações sensíveis em erros
- [ ] Registrei ações importantes em auditoria
- [ ] Implementei rate limiting se necessário
- [ ] Não há dados sensíveis em logs
- [ ] Testes cobrem casos de erro
- [ ] Revisei com checklist de segurança

---

**Versão:** 1.0  
**Última Atualização:** 20 de Fevereiro de 2026  
**Autor:** Manus AI
