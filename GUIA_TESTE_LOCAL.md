# Guia Prático: Testando o Scraper UNIRIO Localmente

Este guia mostra como testar o scraper com credenciais reais do portal UNIRIO em seu computador.

## Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Credenciais válidas de professor no portal UNIRIO

## Passo 1: Clonar o Repositório

```bash
git clone <seu-repositorio>
cd leaderboard-farmacologia
```

## Passo 2: Instalar Dependências

```bash
pnpm install
# ou
npm install
# ou
yarn install
```

## Passo 3: Instalar Chrome para Puppeteer

```bash
npx puppeteer browsers install chrome
```

## Passo 4: Executar Teste Interativo

```bash
node server/test-scraper-v2.mjs
```

O script solicitará:
1. **CPF** (11 dígitos) - Seu CPF de professor
2. **Senha** - Sua senha do portal UNIRIO

Exemplo:
```
Enter professor CPF (11 digits): 08714684764
Enter professor password: Derekriggs38
```

## Passo 5: Analisar Resultados

O script gerará 2 arquivos HTML:

### `debug-01-initial-page.html`
- Estrutura da página de login
- Identifique os campos de entrada (CPF, senha)
- Identifique o botão de envio

**O que procurar:**
```html
<!-- Campo de CPF -->
<input type="text" name="cpf" id="cpf" placeholder="CPF">
<!-- ou -->
<input type="text" name="usuario" id="usuario" placeholder="Usuário">

<!-- Campo de Senha -->
<input type="password" name="senha" id="senha" placeholder="Senha">

<!-- Botão de Envio -->
<button type="submit">Entrar</button>
<!-- ou -->
<input type="submit" value="Entrar">
```

### `debug-02-after-login.html`
- Página após login bem-sucedido
- Procure por tabelas com dados de turmas ou alunos
- Identifique os seletores CSS para extrair dados

**O que procurar:**
```html
<!-- Tabela de turmas -->
<table>
  <thead>
    <tr>
      <th>Código</th>
      <th>Turma</th>
      <th>Professor</th>
      <th>Período</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FARM001</td>
      <td>Farmacologia I - Turma A</td>
      <td>Dr. Pedro Braga</td>
      <td>2026.1</td>
    </tr>
  </tbody>
</table>

<!-- Tabela de alunos -->
<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th>Matrícula</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>João Silva</td>
      <td>joao@edu.unirio.br</td>
      <td>2024001</td>
    </tr>
  </tbody>
</table>
```

## Passo 6: Ajustar Seletores CSS

Se os seletores padrão não funcionarem, edite `server/unirio-scraper.ts`:

### Exemplo 1: Ajustar Seletor de Campo de CPF

**Arquivo:** `server/unirio-scraper.ts`

**Linha ~88-92 (função validateUnirioCredentials):**

```typescript
// ANTES (seletores padrão)
const cpfInputs = await page.$$('input[type="text"], input[name*="cpf"], input[name*="usuario"]');

// DEPOIS (ajustado para seu portal)
const cpfInputs = await page.$$('input#cpf, input[name="usuario"], input.form-control');
```

### Exemplo 2: Ajustar Seletor de Tabela de Turmas

**Linha ~230-240 (função scrapeUnirioClasses):**

```typescript
// ANTES (seletores padrão)
const rows = document.querySelectorAll('table tbody tr, .class-row, .turma-item');

// DEPOIS (ajustado para seu portal)
const rows = document.querySelectorAll('table.turmas tbody tr, div.turma-card');
```

### Exemplo 3: Ajustar Extração de Dados

**Linha ~240-250:**

```typescript
// ANTES (assume ordem específica de colunas)
const code = cells[0]?.textContent?.trim() || '';
const name = cells[1]?.textContent?.trim() || '';
const professor = cells[2]?.textContent?.trim() || '';

// DEPOIS (busca por atributos específicos)
const code = row.querySelector('[data-code]')?.textContent?.trim() || '';
const name = row.querySelector('[data-name]')?.textContent?.trim() || '';
const professor = row.querySelector('[data-professor]')?.textContent?.trim() || '';
```

## Passo 7: Testar Novamente

Após ajustar os seletores, execute o teste novamente:

```bash
node server/test-scraper-v2.mjs
```

Verifique se os dados foram capturados corretamente no console:

```
[TEST] Found 2 classes:
  [0] FARM001 | Farmacologia I - Turma A | Dr. Pedro Braga
  [1] FARM002 | Farmacologia I - Turma B | Dra. Maria Silva

[TEST] Found 84 students:
  [0] João Silva | joao@edu.unirio.br | 2024001
  [1] Maria Santos | maria@edu.unirio.br | 2024002
  ...
```

## Passo 8: Testar na Plataforma

Após validar os seletores, teste o fluxo completo na plataforma:

1. Acesse `/admin`
2. Faça login com suas credenciais de professor
3. Vá para a aba "Importar Alunos"
4. Digite seu CPF e senha
5. Clique em "Validar Credenciais"
6. Clique em "Buscar Turmas"
7. Selecione uma turma
8. Clique em "Preview"
9. Revise os alunos a serem importados
10. Clique em "Importar"

## Dicas de Debugging

### 1. Ativar Logs Detalhados

Edite `server/unirio-scraper.ts` e adicione mais `console.log()`:

```typescript
console.log('[UNIRIO] Página carregada:', page.url());
console.log('[UNIRIO] Título da página:', await page.title());
console.log('[UNIRIO] Conteúdo da página:', (await page.content()).substring(0, 500));
```

### 2. Salvar Screenshots

Adicione ao script de teste:

```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### 3. Inspecionar Elementos

Use o DevTools do Chrome para inspecionar elementos:

1. Abra `debug-01-initial-page.html` no Chrome
2. Clique com botão direito → "Inspecionar"
3. Procure pelos seletores corretos

### 4. Testar Seletores no Console

Abra o console do navegador (F12) e teste:

```javascript
// Testar seletor de CPF
document.querySelectorAll('input[type="text"]')
document.querySelector('input#cpf')
document.querySelector('input[name="usuario"]')

// Testar seletor de turmas
document.querySelectorAll('table tbody tr')
document.querySelectorAll('.turma-item')

// Testar extração de dados
Array.from(document.querySelectorAll('table tbody tr')).map(row => ({
  col1: row.querySelector('td:nth-child(1)')?.textContent,
  col2: row.querySelector('td:nth-child(2)')?.textContent,
  col3: row.querySelector('td:nth-child(3)')?.textContent,
}))
```

## Troubleshooting

### Erro: "CPF input field not found"

**Solução:** Ajuste o seletor de CPF em `server/unirio-scraper.ts` linha ~88

```typescript
// Tente diferentes seletores
const cpfInputs = await page.$$('input[type="text"]');
const cpfInputs = await page.$$('input[placeholder*="CPF"]');
const cpfInputs = await page.$$('input[placeholder*="Usuário"]');
const cpfInputs = await page.$$('input.form-control');
```

### Erro: "Password input field not found"

**Solução:** Ajuste o seletor de senha em `server/unirio-scraper.ts` linha ~97

```typescript
const passwordInputs = await page.$$('input[type="password"]');
const passwordInputs = await page.$$('input[placeholder*="Senha"]');
const passwordInputs = await page.$$('input.form-control');
```

### Erro: "Submit button not found"

**Solução:** Ajuste o seletor de botão em `server/unirio-scraper.ts` linha ~102

```typescript
const submitButton = await page.$('button[type="submit"]');
const submitButton = await page.$('input[type="submit"]');
const submitButton = await page.$('button:contains("Entrar")');
const submitButton = await page.$('button.btn-primary');
```

### Nenhum dado de turmas encontrado

**Solução:** Verifique se você está na página correta após login

```typescript
// Adicione logs para debugar
console.log('[DEBUG] URL atual:', page.url());
console.log('[DEBUG] Título:', await page.title());
console.log('[DEBUG] Conteúdo:', (await page.content()).substring(0, 1000));
```

## Próximos Passos

1. ✓ Testar localmente com credenciais reais
2. ✓ Ajustar seletores CSS conforme necessário
3. ✓ Validar importação de turmas e alunos
4. ✓ Testar fluxo completo na plataforma
5. → Implementar notificações por email
6. → Criar dashboard de histórico de importações

## Referências

- [Puppeteer Documentation](https://pptr.dev/)
- [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Portal UNIRIO](https://portal.unirio.br)

## Suporte

Se encontrar problemas:

1. Verifique os arquivos `debug-*.html` gerados
2. Revise os logs no console
3. Consulte a documentação em `SCRAPING_UNIRIO.md`
4. Abra uma issue no repositório
