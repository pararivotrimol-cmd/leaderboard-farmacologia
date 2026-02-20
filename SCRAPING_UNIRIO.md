# Scraping do Portal UNIRIO

Este documento descreve como o sistema de scraping do portal UNIRIO funciona e como testar/ajustar os seletores CSS.

## Visão Geral

O sistema de scraping permite importar automaticamente turmas e alunos do portal UNIRIO (https://portal.unirio.br) usando as credenciais do professor.

### Componentes

- **`server/unirio-scraper.ts`** - Funções de scraping com Puppeteer
- **`server/routers/unirio.ts`** - Rotas tRPC para integração
- **`client/src/pages/Admin.tsx`** - Interface de importação para o professor
- **`server/test-scraper-v2.mjs`** - Script de teste interativo

## Funções Disponíveis

### `validateUnirioCredentials(cpf, password, config?)`

Valida as credenciais do professor contra o portal UNIRIO.

```typescript
const isValid = await validateUnirioCredentials('08714684764', 'senha123');
```

**Retorna:** `boolean` - `true` se as credenciais são válidas, `false` caso contrário

### `scrapeUnirioClasses(cpf, password, config?)`

Busca todas as turmas disponíveis para o professor.

```typescript
const classes = await scrapeUnirioClasses('08714684764', 'senha123');
// Retorna: UnirioClass[]
// [
//   {
//     id: 'FARM001',
//     code: 'FARM001',
//     name: 'Farmacologia I - Turma A',
//     period: '2026.1',
//     professor: 'Dr. Pedro Braga'
//   },
//   ...
// ]
```

### `scrapeUnirioStudents(cpf, password, classCode?, config?)`

Busca alunos de uma turma específica.

```typescript
const students = await scrapeUnirioStudents('08714684764', 'senha123', 'FARM001');
// Retorna: UnirioStudent[]
```

### `scrapeUnirioAllStudents(cpf, password, config?)`

Busca todos os alunos de todas as turmas do professor.

```typescript
const allStudents = await scrapeUnirioAllStudents('08714684764', 'senha123');
// Retorna: UnirioStudent[]
// [
//   {
//     name: 'João Silva Santos',
//     email: 'joao.silva@edu.unirio.br',
//     matricula: '2024001'
//   },
//   ...
// ]
```

## Configuração

Todas as funções aceitam um objeto `config` opcional:

```typescript
interface ScraperConfig {
  maxRetries?: number;      // Número de tentativas (padrão: 3)
  retryDelay?: number;      // Delay entre tentativas em ms (padrão: 2000)
  timeout?: number;         // Timeout de navegação em ms (padrão: 30000)
  testMode?: boolean;       // Usar dados simulados (padrão: false)
}
```

### Exemplo com Configuração

```typescript
const config = {
  maxRetries: 5,
  retryDelay: 3000,
  timeout: 60000,
  testMode: false
};

const students = await scrapeUnirioAllStudents('08714684764', 'senha123', config);
```

## Modo de Teste

Para testar sem acessar o portal real, use `testMode: true`:

```typescript
const config = { testMode: true };
const classes = await scrapeUnirioClasses('08714684764', 'senha123', config);
// Retorna dados simulados
```

Isso é útil para:
- Testar a lógica de importação sem acessar o portal
- Desenvolvimento em ambientes sem acesso ao portal
- Testes automatizados

## Dados Simulados

Quando `testMode: true` ou o portal não está acessível, o sistema retorna:

### Classes Simuladas

```json
[
  {
    "id": "FARM001",
    "code": "FARM001",
    "name": "Farmacologia I - Turma A",
    "period": "2026.1",
    "professor": "Dr. Pedro Braga"
  },
  {
    "id": "FARM002",
    "code": "FARM002",
    "name": "Farmacologia I - Turma B",
    "period": "2026.1",
    "professor": "Dra. Maria Silva"
  }
]
```

### Alunos Simulados

```json
[
  {
    "name": "João Silva Santos",
    "email": "joao.silva@edu.unirio.br",
    "matricula": "2024001"
  },
  {
    "name": "Maria Santos Oliveira",
    "email": "maria.santos@edu.unirio.br",
    "matricula": "2024002"
  },
  ...
]
```

## Fluxo de Importação

1. **Login** - Professor insere CPF e senha
2. **Validação** - Sistema valida credenciais
3. **Busca de Turmas** - Sistema busca turmas disponíveis
4. **Preview** - Sistema mostra alunos a serem importados
5. **Confirmação** - Professor confirma a importação
6. **Importação** - Sistema cria contas de alunos no banco de dados

## Testando com Credenciais Reais

### Pré-requisitos

- Credenciais válidas de professor no portal UNIRIO
- Acesso ao portal UNIRIO (https://portal.unirio.br)
- Node.js 18+ e Puppeteer instalados

### Executar Teste Interativo

```bash
cd /home/ubuntu/leaderboard-farmacologia
node server/test-scraper-v2.mjs
```

O script solicitará:
1. CPF (11 dígitos)
2. Senha

Ele gerará arquivos de debug:
- `debug-01-initial-page.html` - Estrutura da página de login
- `debug-02-after-login.html` - Página após login

### Analisar Estrutura HTML

Abra os arquivos HTML gerados em um navegador para:

1. **Identificar campos de login**
   - Procure por `<input type="text">` ou `<input name="cpf">`
   - Procure por `<input type="password">`
   - Procure por `<button type="submit">`

2. **Identificar página de turmas**
   - Procure por `<table>` com dados de turmas
   - Procure por `<div class="turma">` ou similar
   - Anote os seletores CSS

3. **Identificar página de alunos**
   - Procure por `<table>` com dados de alunos
   - Procure por `<div class="aluno">` ou similar
   - Anote os seletores CSS

### Ajustar Seletores CSS

Se os seletores padrão não funcionarem, edite `server/unirio-scraper.ts`:

#### Seletores de Login

```typescript
// Linha ~88-92: Ajuste os seletores para encontrar campos de CPF
const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');

// Linha ~97-100: Ajuste para encontrar campo de senha
const passwordInputs = await page.$$('input[type="password"]');

// Linha ~102-104: Ajuste para encontrar botão de envio
const submitButton = await page.$('button[type="submit"], input[type="submit"]');
```

#### Seletores de Turmas

```typescript
// Linha ~230-240: Ajuste para encontrar linhas de turmas
const rows = document.querySelectorAll('table tbody tr, .class-row, .turma-item');

// Dentro do forEach, ajuste para extrair dados das colunas
const code = cells[0]?.textContent?.trim() || '';
const name = cells[1]?.textContent?.trim() || '';
const professor = cells[2]?.textContent?.trim() || '';
const period = cells[3]?.textContent?.trim() || '';
```

#### Seletores de Alunos

```typescript
// Linha ~290-300: Ajuste para encontrar linhas de alunos
const rows = document.querySelectorAll('table tbody tr, .student-row, .aluno-item');

// Dentro do forEach, ajuste para extrair dados das colunas
const name = cells[0]?.textContent?.trim() || '';
const email = cells[1]?.textContent?.trim() || '';
const matricula = cells[2]?.textContent?.trim() || '';
```

## Tratamento de Erros

O sistema trata automaticamente:

- **Credenciais inválidas** - Retorna `false` ou lista vazia
- **Portal indisponível** - Retorna dados simulados
- **Timeout de conexão** - Tenta novamente (até 3 vezes)
- **Campos não encontrados** - Tenta seletores alternativos
- **Duplicatas de alunos** - Remove usando `Set` de emails

## Logs

O sistema registra todas as operações com prefixo `[UNIRIO]`:

```
[UNIRIO] Attempt 1/3
[UNIRIO] Validating credentials for CPF: 087***
[UNIRIO] Credentials validated successfully
[UNIRIO] Scraping classes for CPF: 087***
[UNIRIO] Found 2 classes
[UNIRIO] Scraping all students for CPF: 087***
[UNIRIO] Found 84 students
```

## Segurança

- Credenciais são usadas apenas durante a sessão de scraping
- Senhas não são armazenadas no banco de dados
- Alunos importados recebem senhas geradas aleatoriamente
- Todas as operações são registradas em logs de auditoria

## Próximos Passos

1. **Testar com credenciais reais** - Executar `test-scraper-v2.mjs` com CPF e senha válidos
2. **Ajustar seletores CSS** - Analisar HTML gerado e atualizar seletores conforme necessário
3. **Validar importação** - Testar fluxo completo de importação no painel admin
4. **Implementar notificações** - Enviar emails para alunos importados com credenciais temporárias

## Referências

- [Puppeteer Documentation](https://pptr.dev/)
- [Portal UNIRIO](https://portal.unirio.br)
- [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
