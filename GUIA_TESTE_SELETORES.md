# Guia: Testador Interativo de Seletores CSS

Este guia mostra como usar o script `test-selectors.mjs` para testar e validar seletores CSS contra o portal UNIRIO.

## O que é?

Um script interativo que permite:
- Navegar para diferentes páginas do portal
- Testar seletores CSS em tempo real
- Extrair dados usando seletores
- Listar todos os inputs, botões e tabelas
- Salvar seletores que funcionam

## Como Executar

```bash
cd /home/ubuntu/leaderboard-farmacologia
node server/test-selectors.mjs
```

O script solicitará:
1. **CPF** (11 dígitos)
2. **Senha**

Exemplo:
```
Enter professor CPF (11 digits): 08714684764
Enter professor password: Derekriggs38
```

## Menu Principal

Após fazer login, você verá um menu com 9 opções:

```
╔════════════════════════════════════════════════════════════╗
║                    Main Menu                               ║
╠════════════════════════════════════════════════════════════╣
║ 1. Navigate to URL                                         ║
║ 2. Test CSS Selector                                       ║
║ 3. Extract Data with Selector                              ║
║ 4. List All Input Fields                                   ║
║ 5. List All Buttons                                        ║
║ 6. List All Tables                                         ║
║ 7. Save Page HTML                                          ║
║ 8. View Working Selectors                                  ║
║ 9. Exit                                                    ║
╚════════════════════════════════════════════════════════════╝
```

## Opções Detalhadas

### 1. Navigate to URL

Navega para uma URL específica no portal.

**Exemplo:**
```
Select option (1-9): 1
Enter URL (or relative path): /turmas
```

Você pode usar:
- URLs completas: `https://portal.unirio.br/turmas`
- Caminhos relativos: `/turmas`
- Nomes de página: `turmas`

### 2. Test CSS Selector

Testa um seletor CSS e mostra quantos elementos foram encontrados.

**Exemplo:**
```
Select option (1-9): 2
Enter CSS selector to test: input[type="text"]

[RESULT] Found 3 elements matching "input[type="text"]"

First 5 matches:

  [0] <INPUT>
      id="cpf"
      class="form-control"
      text: ""

  [1] <INPUT>
      id="usuario"
      class="form-control"
      text: ""

  [2] <INPUT>
      id="email"
      class="form-control"
      text: ""
```

**Seletores Úteis para Testar:**

```css
/* Campos de entrada */
input[type="text"]
input[type="password"]
input[name="cpf"]
input[name="usuario"]
input[name="senha"]
input.form-control
input#cpf

/* Botões */
button[type="submit"]
input[type="submit"]
button.btn-primary
button:contains("Entrar")

/* Tabelas */
table
table tbody tr
table thead th
.turma-item
.aluno-item

/* Divs */
div.turma
div.aluno
div[data-turma]
div[data-aluno]
```

### 3. Extract Data with Selector

Extrai dados usando um seletor e escolhe o tipo de extração.

**Exemplo 1: Extrair Texto**
```
Select option (1-9): 3
Enter CSS selector: table tbody tr
Extract: (1) text, (2) HTML, (3) attributes, (4) table data? [1-4]: 1

[EXTRACTED TEXT]
[
  "FARM001 Farmacologia I - Turma A Dr. Pedro Braga 2026.1",
  "FARM002 Farmacologia I - Turma B Dra. Maria Silva 2026.1",
  ...
]
```

**Exemplo 2: Extrair Atributos**
```
Select option (1-9): 3
Enter CSS selector: input[type="text"]
Extract: (1) text, (2) HTML, (3) attributes, (4) table data? [1-4]: 3

[EXTRACTED ATTRIBUTES]
[
  {
    "tag": "INPUT",
    "id": "cpf",
    "class": "form-control",
    "name": "cpf",
    "type": "text",
    "placeholder": "CPF",
    "value": ""
  },
  ...
]
```

**Exemplo 3: Extrair Dados de Tabela**
```
Select option (1-9): 3
Enter CSS selector: table tbody tr
Extract: (1) text, (2) HTML, (3) attributes, (4) table data? [1-4]: 4

[EXTRACTED TABLE DATA]
[
  [
    "FARM001",
    "Farmacologia I - Turma A",
    "Dr. Pedro Braga",
    "2026.1"
  ],
  [
    "FARM002",
    "Farmacologia I - Turma B",
    "Dra. Maria Silva",
    "2026.1"
  ],
  ...
]
```

### 4. List All Input Fields

Lista todos os campos de entrada (input) da página atual.

**Exemplo:**
```
Select option (1-9): 4

[INPUT FIELDS] Found 5 input fields:

  [0] <input type="text" ✓>
      name="cpf"
      id="cpf"
      placeholder="CPF"

  [1] <input type="password" ✓>
      name="senha"
      id="senha"
      placeholder="Senha"

  [2] <input type="submit" ✓>
      value="Entrar"

  [3] <input type="hidden" ✓>
      name="csrf_token"

  [4] <input type="text" ✗>
      name="email"
      placeholder="Email"
```

O `✓` indica que o elemento é visível, `✗` indica que está oculto.

### 5. List All Buttons

Lista todos os botões da página atual.

**Exemplo:**
```
Select option (1-9): 5

[BUTTONS] Found 3 buttons:

  [0] <BUTTON type="submit">
      text: "Entrar"
      id="btn-login"

  [1] <BUTTON type="button">
      text: "Esqueci minha senha"
      class="btn btn-link"

  [2] <A role="button">
      text: "Cadastrar"
      class="btn btn-secondary"
```

### 6. List All Tables

Lista todas as tabelas da página atual com suas estruturas.

**Exemplo:**
```
Select option (1-9): 6

[TABLES] Found 2 tables:

  [0] <table> (10 rows)
      id="turmas-table"
      class="table table-striped"
      headers: [Código, Turma, Professor, Período]
      first row: [FARM001, Farmacologia I - Turma A, Dr. Pedro Braga, 2026.1]

  [1] <table> (84 rows)
      id="alunos-table"
      class="table"
      headers: [Nome, Email, Matrícula]
      first row: [João Silva, joao@edu.unirio.br, 2024001]
```

### 7. Save Page HTML

Salva o HTML da página atual em um arquivo para análise posterior.

**Exemplo:**
```
Select option (1-9): 7

[SUCCESS] Page HTML saved to: debug-page-2026-02-20T23-45-30-123Z.html
```

Você pode abrir este arquivo no navegador e usar o DevTools (F12) para inspecionar elementos.

### 8. View Working Selectors

Mostra todos os seletores que você testou com sucesso.

**Exemplo:**
```
Select option (1-9): 8

[WORKING SELECTORS]
  ✓ "input[type="text"]" (3 matches)
  ✓ "table tbody tr" (84 matches)
  ✓ "button[type="submit"]" (1 matches)
  ✓ "input[name="cpf"]" (1 matches)
```

Ao sair do script, os seletores que funcionaram são salvos em `working-selectors.json`.

### 9. Exit

Sai do script e salva os seletores que funcionaram em `working-selectors.json`.

## Workflow Prático

### Passo 1: Testar Seletores de Login

```
1. Execute: node server/test-selectors.mjs
2. Faça login com suas credenciais
3. Opção 4: List All Input Fields
   → Veja quais campos existem
4. Opção 2: Test CSS Selector
   → Teste: input[name="cpf"]
   → Teste: input[type="password"]
   → Teste: button[type="submit"]
```

### Passo 2: Testar Seletores de Turmas

```
1. Opção 1: Navigate to URL
   → Digite: /turmas
2. Opção 6: List All Tables
   → Veja a estrutura das tabelas
3. Opção 2: Test CSS Selector
   → Teste: table tbody tr
   → Teste: table#turmas-table tbody tr
4. Opção 3: Extract Data with Selector
   → Selector: table tbody tr
   → Type: 4 (table data)
   → Veja os dados extraídos
```

### Passo 3: Testar Seletores de Alunos

```
1. Opção 1: Navigate to URL
   → Digite: /alunos
2. Opção 6: List All Tables
   → Veja a estrutura das tabelas
3. Opção 2: Test CSS Selector
   → Teste: table tbody tr
   → Teste: .aluno-item
4. Opção 3: Extract Data with Selector
   → Selector: table tbody tr
   → Type: 4 (table data)
   → Veja os dados extraídos
```

## Salvando Resultados

### Arquivo: `working-selectors.json`

Criado automaticamente ao sair do script com os seletores que funcionaram:

```json
{
  "input[type=\"text\"]": 3,
  "table tbody tr": 84,
  "button[type=\"submit\"]": 1,
  "input[name=\"cpf\"]": 1
}
```

### Arquivo: `debug-page-*.html`

Salvo quando você usa a opção 7. Contém o HTML completo da página para análise.

## Dicas Úteis

### 1. Testar Múltiplos Seletores

Se um seletor não funciona, tente variações:

```
Teste 1: input[type="text"]
Teste 2: input[name="cpf"]
Teste 3: input.form-control
Teste 4: input#cpf
Teste 5: input[placeholder*="CPF"]
```

### 2. Usar DevTools do Navegador

1. Salve a página HTML (opção 7)
2. Abra em um navegador
3. Pressione F12 para abrir DevTools
4. Use o inspetor para encontrar seletores
5. Teste no script

### 3. Extrair Dados Estruturados

Para extrair dados de tabelas:

```
Opção 3: Extract Data with Selector
Selector: table tbody tr
Type: 4 (table data)
```

Isso retorna um array de arrays com os dados estruturados.

### 4. Navegar Entre Páginas

```
Opção 1: Navigate to URL
URLs úteis:
  - /turmas (página de turmas)
  - /alunos (página de alunos)
  - /docente/turmas (turmas do docente)
  - /docente/alunos (alunos do docente)
```

## Troubleshooting

### Problema: "No elements found with this selector"

**Solução:**
1. Verifique se você está na página correta (opção 1)
2. Salve a página HTML (opção 7)
3. Abra no navegador e inspecione (F12)
4. Procure pelo elemento manualmente
5. Teste um seletor mais genérico (ex: `input` em vez de `input[name="cpf"]`)

### Problema: Dados não aparecem

**Solução:**
1. Use opção 6 para listar tabelas
2. Procure pela tabela correta
3. Use opção 3 para extrair dados
4. Verifique se a tabela tem dados

### Problema: Página não carrega

**Solução:**
1. Verifique a URL (opção 1)
2. Aguarde mais tempo (a página pode estar carregando)
3. Tente uma URL diferente
4. Salve a página HTML e verifique o conteúdo

## Próximos Passos

1. ✓ Testar seletores de login
2. ✓ Testar seletores de turmas
3. ✓ Testar seletores de alunos
4. → Atualizar `server/unirio-scraper.ts` com os seletores que funcionaram
5. → Testar importação completa na plataforma

## Referências

- [CSS Selectors MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [Puppeteer Documentation](https://pptr.dev/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
