# Brainstorm de Design - Leaderboard XP Farmacologia I

## Contexto
Leaderboard gamificado para turma de 80 alunos de Medicina (4º período) na disciplina de Farmacologia I. Precisa ser acessível via celular e desktop, fácil de atualizar pelo professor via JSON, e visualmente engajante para manter a motivação dos alunos.

---

<response>
<text>
## Ideia 1: "Neon Arcade" — Estética Retro-Gaming

**Design Movement:** Inspirado em arcades dos anos 80 e interfaces de jogos retro, com influências de Tron e pixel art.

**Core Principles:**
1. Tipografia monospace com efeitos de glow neon
2. Fundo escuro com grades de perspectiva e linhas de neon
3. Animações de "power-up" ao ganhar XP
4. Barras de progresso pixeladas com efeitos de brilho

**Color Philosophy:** Fundo preto profundo (#0a0a0f) com neon ciano (#00f0ff), magenta (#ff00ff) e verde elétrico (#00ff88). As cores neon evocam a energia e competitividade dos arcades.

**Layout Paradigm:** Layout vertical scrollável com seções empilhadas: header com logo animado, destaques em cards flutuantes com glow, ranking em tabela com linhas que brilham ao hover.

**Signature Elements:** Scanlines sutis sobre o fundo, bordas com glow neon pulsante, ícones pixelados para badges.

**Interaction Philosophy:** Hover causa intensificação do glow, transições com efeito de "glitch".

**Animation:** Entrada com efeito de "boot de computador", números de XP contam de 0 até o valor real.

**Typography System:** Space Mono (monospace) para números e rankings, Press Start 2P para títulos, Inter para corpo de texto legível.
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Ideia 2: "Pharma Lab Dashboard" — Estética de Painel Científico

**Design Movement:** Inspirado em dashboards de laboratório farmacêutico e interfaces de monitoramento hospitalar, com toques de data visualization científica.

**Core Principles:**
1. Hierarquia visual baseada em dados, não decoração
2. Gráficos e visualizações como elementos centrais
3. Paleta fria e profissional com acentos de alerta
4. Tipografia técnica com números tabulares

**Color Philosophy:** Fundo escuro azul-marinho (#0f172a) representando a seriedade da ciência, com acentos em verde-esmeralda (#10b981) para progresso positivo, âmbar (#f59e0b) para alertas, e ciano (#06b6d4) para dados neutros. O verde remete a indicadores de saúde e vitalidade.

**Layout Paradigm:** Dashboard assimétrico com sidebar fixa contendo filtros e resumo, área principal com grid de cards de dados e gráficos de barras horizontais para o ranking. Inspirado em painéis de monitoramento de UTI.

**Signature Elements:** Indicadores circulares tipo "gauge" para XP total, linhas de grid pontilhadas como papel milimetrado, ícones de moléculas e cápsulas como decoração sutil.

**Interaction Philosophy:** Tooltips informativos ao hover, expansão suave de cards para detalhes, filtros que reorganizam o layout com transição fluida.

**Animation:** Barras de progresso que "enchem" como líquido em proveta, números que incrementam suavemente, pulso sutil em indicadores ativos.

**Typography System:** JetBrains Mono para números e dados, Inter para texto, Outfit para títulos. Números sempre com font-variant-numeric: tabular-nums.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Ideia 3: "RPG Quest Board" — Estética de Jogo de RPG Medieval-Fantasia

**Design Movement:** Inspirado em interfaces de jogos RPG como World of Warcraft e Final Fantasy, com elementos de pergaminho, emblemas e sistema de ranks.

**Core Principles:**
1. Cada equipe é uma "guilda" com emblema e cores próprias
2. Progressão visual tipo "barra de experiência" de RPG
3. Ranks com nomes temáticos (Aprendiz → Alquimista → Mestre Farmacologista)
4. Textura de pergaminho e elementos medievais adaptados

**Color Philosophy:** Fundo em tons de pergaminho envelhecido (#1a1a2e deep purple-black), com dourado (#fbbf24) para conquistas, vermelho rubi (#dc2626) para desafios, e azul royal (#3b82f6) para informações. O dourado evoca conquista e prestígio.

**Layout Paradigm:** Página única scrollável com seções temáticas: "Taverna" (destaques), "Arena" (ranking de equipes), "Hall da Fama" (top individual). Cada seção tem um header decorativo com bordas ornamentais.

**Signature Elements:** Emblemas hexagonais para equipes, barras de XP estilizadas como barras de vida de RPG, badges com ícones de poções e frascos.

**Interaction Philosophy:** Cards que "viram" ao clicar revelando detalhes, efeitos de partículas douradas em conquistas.

**Animation:** Barras de XP com gradiente animado, emblemas que brilham ao atingir marcos, entrada com fade-in sequencial.

**Typography System:** Cinzel Decorative para títulos (evoca manuscritos), Space Grotesk para subtítulos, DM Sans para corpo.
</text>
<probability>0.07</probability>
</response>

---

## Decisão: Ideia 2 — "Pharma Lab Dashboard"

A estética de Painel Científico é a mais adequada para o contexto acadêmico de Farmacologia em uma universidade federal. Ela é profissional o suficiente para ser levada a sério pelos alunos de Medicina, mas visualmente sofisticada e gamificada o bastante para manter o engajamento. Os elementos de dashboard científico reforçam a identidade da disciplina.
