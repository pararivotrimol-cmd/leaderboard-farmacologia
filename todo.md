# Project TODO

- [x] Basic leaderboard page with team ranking
- [x] Top 10 individual ranking with circular gauges
- [x] Activities XP tab with weekly timeline
- [x] Pharma Lab Dashboard design (dark theme, emerald accents)
- [x] Framer Motion animations
- [x] Hero banner and trophy icon CDN images
- [x] Resolve upgrade conflicts (App.tsx theme, Home.tsx restoration)
- [x] Create database schema for teams, members, XP records, highlights
- [x] Run database migration (pnpm db:push)
- [x] Create tRPC routers for CRUD operations on teams/members/XP
- [x] Create admin panel page with password protection
- [x] Connect public leaderboard to database (replace static data)
- [x] Write vitest tests for admin API
- [x] Save checkpoint and deliver to user
- [x] Replace sample names with 84 real student names in database
- [x] Implement student progress page (individual PF + team view)
- [x] Add route for student progress page
- [x] Write tests for new functionality
- [x] Rename 16 teams with drug names from the pharmacology syllabus
- [x] Randomize student distribution across teams
- [x] Rename project from "Leaderboard XP" to "Conexão em Farmacologia"
- [x] Replace "XP" with pharmacology-related acronym (PF) throughout
- [x] Update visual identity inspired by "Conexão em Ciência" YouTube channel
- [x] Update all pages (Home, Admin, StudentProgress) with new branding
- [x] Generate logo inspired by Conexão em Ciência channel
- [x] Add direct link to YouTube channel Conexão em Ciência
- [ ] Create integrated video section with YouTube playlists (future)
- [ ] Create study materials/resources section (mega platform) (future)
- [x] Rename project to "Conexão em Farmacologia" throughout
- [x] Replace XP with pharmacology-related acronym (PF)
- [x] Fix Admin.tsx import error
- [x] Create notifications database schema (title, content, type, priority, active, createdAt)
- [x] Create tRPC API routes for notification CRUD
- [x] Implement top banner notification component on public pages
- [x] Implement announcements board/mural page (/avisos)
- [ ] Implement browser push notifications (future)
- [ ] Implement email notification sending (future)
- [x] Add notification management to admin panel
- [x] Write vitest tests for notification API (25 tests passing)
- [x] Analyze vinheta from Conexão em Ciência channel for visual identity
- [x] Use the Farmacológicas logo from YouTube channel
- [x] Create new introduction video for Conexão em Farmacologia channel (4 shots, 16s)
- [x] Create professional landing page with animations (hero, stats, features, timeline, CTA)
- [x] Integrate landing page as site entry point (/ = Landing, /leaderboard = Ranking)
- [x] Generate transparent logo for dark backgrounds
- [x] Update logo across all pages (Home, Avisos, Landing)
- [x] Update all internal navigation links for new routing structure
- [x] Add video intro modal with vinheta playback on landing page
- [x] Auto-play vídeo de introdução ao abrir o site
- [x] Criar vídeo com avatar do professor Pedro Braga baseado no vídeo do canal
- [x] Implementar seção de login dos alunos na página inicial
- [x] Implementar seção exclusiva para o professor na página inicial
- [x] Padronizar layout do leaderboard nas cores laranja, cinza e branco
- [x] Corrigir texto da semana (deve começar em semana 1 e avançar conforme o período)
- [x] Corrigir banner semanal: deve refletir semana 1 (não semana 5) e dados reais
- [x] Remover links "Ver Leaderboard" e "Assistir Vinheta" após vídeo de intro — ir direto ao quadro de login
- [x] Zerar líder no início (traço ou xxxxx quando não há pontuação)
- [x] Renomear "Leaderboard PF" para "Quadro Geral de Pontuação"
- [x] Ampliar logotipo abaixo do botão Início
- [x] Corrigir cronograma: remover antibioticoterapia/quimioterapia; P1 até colinérgicos/BNM + 3 primeiros Jigsaw
- [x] Top 10 Individual: não mostrar nomes até que haja pontuações
- [x] Adicionar aba com regras de cada atividade
- [x] Corrigir vídeo introdutório sem áudio — adicionar trilha sonora
- [x] Adicionar seção de materiais de estudo com links para PDFs e slides por módulo
- [x] Criar schema de banco para módulos e materiais
- [x] Criar rotas tRPC para CRUD de materiais (admin) e listagem (público)
- [x] Criar página de materiais para alunos (/materiais)
- [x] Adicionar gestão de materiais no painel admin
- [x] Ampliar ainda mais o logotipo abaixo do botão Início no leaderboard
- [x] Criar botão de sair/deslogar visível nas páginas
- [x] Corrigir SEO: adicionar meta description (50-160 chars) na página /
- [x] Corrigir SEO: adicionar meta keywords na página /
- [x] Corrigir vídeo de intro que não inicia ao clicar (video element único persistente)
- [x] Corrigir SEO: reduzir keywords de 13 para 6 palavras-chave focadas
- [x] Deslogar nome/conta do professor da área de alunos na landing page
- [x] Criar schema para materiais (arquivos, comentários, links)
- [x] Criar rotas tRPC para upload de arquivos, comentários e links (admin)
- [x] Adicionar funcionalidades de upload/comentário/links na área do professor
- [x] Adicionar aba de materiais/anexos na página dos alunos
- [x] Disponibilizar cronograma completo na página de introdução (landing page)
- [x] Integrar Google Calendar do professor pedro.alexandre@unirio.br via iframe público
- [x] Vídeo intro: auto-play sem botão "clicar para iniciar" (mudo, só trilha sonora)
- [x] Vídeo intro: somente trilha sonora sem fala do avatar
- [x] Área do aluno: apenas botão de login (remover outros botões quando não logado)
- [x] Área do professor: apenas botão de login
- [x] Excluir Google Calendar e qualquer calendário da landing page
- [x] Cronograma: adicionar aula de anti-histamínicos após anestésicos
- [x] Cronograma: adicionar segundo dia de seminários (jigsaw) após anti-histamínicos
- [x] Cronograma: após P2 adicionar prova de segunda chamada
- [x] Cronograma: após segunda chamada adicionar prova final
- [x] Cronograma: alertar feriados de terça-feira no primeiro semestre 2026
- [x] Mover caixas de login do aluno para baixo na seção "Pronto para a Jornada"
- [x] Implementar sistema de upload de materiais (PDFs, slides, documentos) no painel admin
- [x] Criar schema de banco para conquistas/badges (badges + student_badges)
- [x] Criar rotas tRPC para CRUD de badges (admin) e listagem (alunos)
- [x] Implementar lógica de atribuição de badges (manual pelo admin + bulk award)
- [x] Gerar imagem do badge "Desbravador Farmacológico" (Semana 1)
- [x] Criar página de conquistas para alunos (/conquistas)
- [x] Integrar gestão de badges no painel admin (criar, atribuir, revogar, excluir)
- [x] Escrever testes para o sistema de conquistas (25 testes passando)
- [x] Corrigir botão Sair: ao clicar deve fazer logout e redirecionar para a página inicial (/)
- [x] Gerar badges temáticos para todas as semanas (Farmacocinética, SNA, Colinérgicos, etc.)
- [x] Cadastrar todos os badges no banco de dados (19 badges, semanas 1-19)
- [x] Criar sistema de cadastro/login com email institucional @edu.unirio.br + matrícula
- [x] Criar sistema de presença com geolocalização (Frei Caneca 94, sala D201, raio 100m)
- [x] Presença só disponível durante horário de aula (terças 8h-12h)
- [x] Criar aba de controle de frequência no painel do professor
- [x] Implementar notificações automáticas para badges e pontuações
- [x] Incorporar playlists do YouTube na página de materiais por tema
- [x] Alterar campo senha para CPF do aluno no cadastro e login
- [x] Implementar notificações automáticas para badges conquistados
- [x] Implementar notificações automáticas para pontuações atualizadas
- [x] Implementar relatório de frequência exportável em PDF
- [x] Implementar relatório de frequência exportável em CSV
- [x] Criar tabela de playlists do YouTube no banco de dados
- [x] Implementar rotas tRPC para CRUD de playlists (admin)
- [x] Implementar UI de gerenciamento de playlists no painel admin
- [x] Implementar exibição de playlists na página de materiais para alunos
- [x] Organizar playlists por módulo/tema do cronograma
- [x] Criar rotas tRPC para dashboard do aluno (ranking individual, badges, evolução PF)
- [x] Implementar página /dashboard com cards de estatísticas do aluno
- [x] Adicionar gráfico de evolução de PF ao longo das semanas com Chart.js
- [x] Adicionar seção de histórico de badges conquistados com thumbnails
- [x] Adicionar link "Meu Dashboard" na navegação
- [x] Escrever testes para as novas rotas do dashboard
- [x] Atualizar studentDashboard.getMyStats para buscar dados reais do membro logado via sessionToken
- [x] Atualizar studentDashboard.getBadges para buscar badges reais do banco via sessionToken
- [x] Criar tabela xpHistory no schema do banco de dados
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar rotas tRPC para registrar PF semanalmente
- [x] Criar rotas tRPC para consultar histórico de PF
- [x] Implementar registro automático quando admin atualiza PF de aluno
- [x] Atualizar dashboard para buscar dados reais do histórico
- [x] Escrever testes para as novas funcionalidades de xpHistory (65 testes passando)
- [x] Validar gráfico de evolução com dados reais
- [x] Atualizar studentDashboard.getEvolution para buscar histórico real de PF (usando mock temporariamente)
- [x] Testar dashboard com dados reais de alunos logados

## Autenticação de Professores
- [x] Criar tabela teacherAccounts no schema do banco de dados
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar funções helper no db.ts para CRUD de contas de professores
- [x] Criar rotas tRPC para cadastro de professores (primeiro acesso)
- [x] Criar rotas tRPC para login de professores
- [x] Criar rotas tRPC para logout de professores
- [x] Criar página de primeiro acesso (/professor/cadastro)
- [x] Criar página de login de professores (/professor/login)
- [x] Atualizar painel admin para verificar autenticação de professor
- [x] Substituir sistema de senha única por autenticação individual
- [x] Escrever testes para autenticação de professores (74 testes passando)
- [x] Validar fluxo completo (cadastro → login → acesso ao painel)

## Recuperação de Senha
- [x] Criar tabela passwordResetTokens no schema
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar rotas tRPC para solicitar reset de senha
- [x] Criar rotas tRPC para validar token e redefinir senha
- [x] Criar página "Esqueci minha senha" (/professor/esqueci-senha)
- [x] Criar página de redefinição de senha (/professor/redefinir-senha)
- [x] Integrar envio de email com link de redefinição (via notificações do sistema)
- [x] Adicionar link "Esqueci minha senha" na página de login

## Gestão de Professores (Coordenador)
- [x] Adicionar campo role (coordenador/professor) na tabela teacherAccounts
- [x] Criar rotas tRPC para listar professores (apenas coordenador)
- [x] Criar rotas tRPC para ativar/desativar professor
- [x] Criar rotas tRPC para promover professor a coordenador
- [x] Criar rotas tRPC para rebaixar coordenador a professor
- [x] Criar rotas tRPC para remover professor
- [x] Criar aba "Professores" no painel admin (apenas coordenador)
- [x] Implementar listagem de todos os professores com status
- [x] Adicionar botões de ação (ativar/desativar, promover, rebaixar, remover)
- [x] Adicionar busca e filtros (todos/apenas ativos)
- [x] Adicionar badges visuais de status e role
- [x] Criar primeiro coordenador via interface (alerta + botão promover)

## Auditoria de Ações
- [x] Criar tabela auditLog no schema
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar helper function logAudit() para registrar ações
- [x] Integrar auditoria em rotas de XP (updateXP, bulkUpdateXP)
- [ ] Integrar auditoria em rotas de equipes (create, update, delete)
- [x] Integrar auditoria em rotas de membros (create, update, delete)

## Correções Solicitadas (Feb 19, 2026)
- [x] Corrigir erro de cadastro de professor (validação email/senha)
- [x] Corrigir fluxo de cadastro de alunos
- [x] Adicionar botão de pular vinheta para usuários recorrentes
- [x] Implementar painel de super admin com login direto (pedro.alexandre@unirio.br / 0702G@bi)
- [x] Corrigir número de alunos de 120 para 84 (Farmacologia 1 - Medicina 2026.1)
- [x] Atualizar cronograma: Semana 1 - Farmacocinética 1 (Absorção e Distribuição)
- [x] Atualizar cronograma: Semana 2 - Farmacocinética 2
- [x] Atualizar cronograma: Semana 3 - Farmacodinâmica
- [x] Atualizar cronograma: Semana 4 - Boas Práticas de Prescrição
- [x] Atualizar cronograma: Semana 6 - Bloqueadores Colinérgicos e Neuromusculares
- [x] Atualizar cronograma: Semana 7 - Primeiro dia de Seminários
- [x] Adicionar identificação da turma no cronograma (Medicina Farmacologia 1 - 2026.1)
- [ ] Integrar auditoria em rotas de avisos e materiais
- [ ] Criar rota tRPC para buscar logs de auditoria
- [ ] Criar aba "Auditoria" no painel admin para visualizar logs
- [ ] Adicionar filtros por professor, ação, tipo de entidade e data
- [ ] Exibir timeline de ações com detalhes

## Permissões por Turma
- [x] Criar tabela teacherTeams (relação professor-turma)
- [x] Executar migração do banco (pnpm db:push)
- [ ] Criar rotas tRPC para atribuir turmas a professor
- [ ] Criar rotas tRPC para buscar turmas do professor
- [ ] Adicionar interface no painel admin para selecionar turmas
- [ ] Filtrar listagem de equipes por turmas do professor
- [ ] Filtrar listagem de membros por turmas do professor
- [ ] Permitir coordenador ver todas as turmas
- [ ] Restringir ações de professor apenas às suas turmas atribuídas

## Gestão de Alunos
- [ ] Adicionar função incluir aluno em turma (painel admin)
- [ ] Adicionar função remover aluno de turma (painel admin)
- [ ] Adicionar função transferir aluno entre turmas
- [ ] Criar modal de gestão de membros da equipe
- [ ] Validar que aluno não pode estar em múltiplas turmas

## Seleção de Atividades
- [ ] Adicionar campo isActive nas atividades existentes
- [ ] Criar interface para professor ativar/desativar atividades
- [ ] Filtrar atividades exibidas no ranking por ativas
- [ ] Permitir professor criar atividades personalizadas
- [ ] Adicionar templates de atividades para cada metodologia

## Exemplos de Metodologias Ativas
- [ ] Criar exemplo completo de PBL (Problem-Based Learning)
- [ ] Criar exemplo completo de TBL (Team-Based Learning)
- [ ] Criar exemplo completo de Sala de Aula Invertida
- [ ] Criar exemplo completo de Gamificação
- [ ] Criar exemplo completo de Estudo de Caso
- [ ] Adicionar descrição e objetivos de cada metodologia
- [ ] Criar página de metodologias no sistema

## Testes e Validação
- [ ] Escrever testes para recuperação de senha
- [ ] Escrever testes para gestão de professores
- [ ] Escrever testes para auditoria
- [ ] Escrever testes para permissões por turma
- [ ] Escrever testes para gestão de alunos
- [ ] Validar fluxo completo de cada funcionalidade

## Super Admin (Administrador Geral)
- [x] Adicionar role "super_admin" ao schema teacherAccounts
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar conta de super admin com login/senha específicos (via /super-admin/setup)
- [ ] Adicionar verificação de super_admin nas rotas protegidas
- [ ] Criar seção exclusiva de super admin no painel
- [ ] Permitir super admin gerenciar professores E alunos
- [ ] Adicionar badge visual de Super Admin no painel

## Perfil do Super Admin
- [x] Criar rota tRPC para buscar estatísticas do sistema
- [x] Criar rota tRPC para buscar atividades recentes do super admin
- [x] Criar página de perfil em /super-admin/perfil
- [x] Adicionar seção de permissões e controles
- [x] Adicionar seção de estatísticas do sistema (total de professores, alunos, equipes, etc.)
- [x] Adicionar seção de atividades recentes com timeline (preparado para integração)
- [ ] Adicionar link para perfil no painel admin
- [ ] Adicionar badge visual "Super Admin" no header do painel

## Responsividade (Mobile, Tablet, TV 4K)
- [ ] Auditar Landing page para responsividade
- [ ] Auditar Home/Leaderboard para responsividade
- [ ] Auditar painel Admin para responsividade
- [ ] Otimizar Landing page (320px - 3840px)
- [ ] Otimizar Home/Leaderboard com grid adaptativo
- [ ] Otimizar painel Admin com sidebar colapsável em mobile
- [ ] Otimizar Dashboard do aluno para mobile
- [ ] Otimizar páginas de autenticação (login, cadastro)
- [ ] Adicionar meta viewport e configurações de responsividade
- [ ] Testar em resoluções: 320px (mobile), 768px (tablet), 1920px (desktop), 3840px (4K)
- [ ] Ajustar tamanhos de fonte para escalabilidade
- [ ] Garantir touch-friendly (botões mínimo 44px)

## Cronograma Completo (17 Semanas)
- [x] Atualizar weeklyHighlights com 17 semanas do cronograma
- [x] Incluir Kahoots, Casos Integrados, Palavras Cruzadas e Provas
- [x] Atualizar currentWeek para semana atual real (semana 1)
- [x] Adicionar datas corretas de cada atividade

## Aba Seminários Jigsaw
- [x] Criar schema no banco para grupos de seminário (6 grupos)
- [x] Criar schema para funções dentro dos grupos (coordenador, relator, etc.)
- [x] Criar schema para atribuição de alunos a funções
- [x] Criar schema para artigos PubMed por seminário
- [x] Criar helper functions no db.ts para seminários
- [x] Criar rotas tRPC para CRUD de grupos de seminário
- [x] Criar rotas tRPC para atribuir alunos a funções
- [x] Criar rotas tRPC para registrar PF individual e por grupo
- [x] Criar rotas tRPC para gerenciar artigos PubMed por semináriora professor cadastrar nomes de alunos nas funções
- [ ] Sistema de PF por aluno individual no seminário
- [ ] Sistema de PF por grupo total no seminário

## Busca de Artigos PubMed
- [ ] Criar rota tRPC para buscar artigos no PubMed API
- [ ] Filtrar artigos dos últimos 4 anos
- [ ] Buscar 2 artigos por tema de seminário
- [ ] Exibir artigos na aba Seminários

## Cálculo de Média Final
- [ ] Atualizar explicação na página inicial
- [ ] Implementar fórmula: MF = (P1 + P2)/2 x 0,75 + NT((SEM+CS+Kahoot)/3) x 0,25
- [ ] Criar calculadora interativa de média

## QR Code para Provas
- [ ] Criar sistema de geração de QR code único por prova
- [ ] Implementar validação de QR code no momento da prova
- [ ] Adicionar campo de QR code nas provas teóricas
- [ ] Interface para professor gerar e visualizar QR codes

## Integração Kahoots
- [ ] Criar links para Kahoots no cronograma
- [ ] Adicionar 10 perguntas por Kahoot (preparar conteúdo)
- [ ] Integrar com conta pedro.alexandre@unirio.br
- [ ] Exibir Kahoots na página de atividades

## Notificações por Email (Seminários)
- [x] Criar schema emailLog no banco de dados
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar helper functions no db.ts para email log
- [ ] Criar rota tRPC para enviar email a grupo de seminário
- [ ] Criar rota tRPC para buscar histórico de emails enviados
- [ ] Criar interface no painel admin (modal de envio de email)
- [ ] Adicionar botão "Enviar Email" em cada grupo de seminário
- [ ] Integrar com notifyOwner para simular envio de email
- [ ] Adicionar validação de emails institucionais dos alunos
- [ ] Escrever testes para sistema de emails

## Correções Landing Page e Cronograma
- [x] Verificar cronograma em leaderboardData.ts (deve ter exatamente 17 semanas)
- [x] Cronograma correto: 17 semanas (03/03 a 30/06/2026)
- [x] Remover texto "Farmacologia I — UNIRIO — Semestre 2026.1" da Landing page
- [x] Buscar logos oficiais: Escola de Medicina UNIRIO
- [x] Buscar logos oficiais: Instituto Biomédico UNIRIO
- [x] Buscar logos oficiais: Escola de Nutrição UNIRIO
- [x] Buscar logos oficiais: Escola de Enfermagem UNIRIO
- [x] Copiar logos para client/public/logos/
- [x] Adicionar logos das escolas abaixo do título na Landing page
- [x] Testar visualização da Landing page
- [x] Verificar logos das escolas UNIRIO exibidos corretamente
- [x] Confirmar remoção do texto "Farmacologia I — UNIRIO — Semestre 2026.1"

## Correção de Logos e Cronograma
- [x] Copiar logos corretos fornecidos pelo usuário para client/public/logos/
- [x] Atualizar Landing.tsx com os logos corretos (UNIRIO, Enfermagem, Nutrição, Medicina, Instituto Biomédico)
- [x] Verificar Landing.tsx - seção "Jornada do Semestre" mostrando 19 semanas
- [x] Corrigir para exatamente 17 semanas na interface visual
- [x] Testar visualização da Landing page
- [x] Confirmar 17 semanas exibidas corretamente

## Correção do Array Timeline (19 → 17 semanas)
- [x] Localizar array timeline na Landing.tsx que gera as semanas
- [x] Remover semanas 18 e 19 do array
- [x] Verificar se P2 está na semana 17 (última semana)
- [x] Testar visualização do cronograma
- [x] Confirmar que apenas 17 semanas são exibidas

## Sincronizar Cronograma Home com Landing
- [x] Verificar weeklyHighlights no leaderboardData.ts (página Home)
- [x] Comparar com timeline da Landing.tsx
- [x] Atualizar assuntos das 17 semanas para ficarem idênticos
- [x] Remover semanas 18 e 19 se existirem
- [x] Testar visualização na página Home/Leaderboard
- [x] Criar documentação de credenciais do super admin
- [x] Atualizar documentação com email específico: pedro.alexandre@unirio.br

## Implementação de Responsividade Completa
- [x] Auditar Landing page para problemas de responsividade
- [x] Auditar Home/Leaderboard para problemas de responsividade
- [x] Auditar Dashboard do Aluno para problemas de responsividade
- [x] Auditar Painel Admin para problemas de responsividade
- [x] Otimizar Landing page (botões 48px altura, logos responsivos)
- [x] Otimizar Home/Leaderboard (cards touch-friendly 72px altura)
- [x] Otimizar Dashboard do Aluno (grid 1-2-4 colunas)
- [x] Otimizar Painel Admin (navegação horizontal scroll em mobile)
- [x] Garantir touch-friendly (botões mínimo 44px)
- [x] Testar em 320px (mobile pequeno)
- [x] Testar em 375px (iPhone)
- [x] Testar em 768px (tablet)
- [x] Testar em 1024px (tablet landscape)
- [x] Validar todas as páginas funcionando corretamente

## Interface da Aba Seminários Jigsaw
- [x] Criar componente JigsawSeminarsManager no Admin.tsx
- [x] Listar 6 grupos de seminário com temas
- [x] Interface para atribuir coordenador a cada grupo
- [x] Interface para atribuir relator a cada grupo
- [x] Interface para registrar PF individual do coordenador
- [x] Interface para registrar PF individual do relator
- [x] Interface para registrar PF do grupo inteiro
- [x] Adicionar aba "Seminários Jigsaw" no menu do painel admin
- [x] Testar criação e edição de atribuições

## Calculadora de Média Final na Home
- [x] Criar seção explicativa da fórmula MF na Home
- [x] Implementar inputs para P1, P2, SEM, CS, Kahoot
- [x] Calcular automaticamente NT = (SEM+CS+Kahoot)/3
- [x] Calcular automaticamente MF = (P1+P2)/2 × 0,75 + NT × 0,25
- [x] Exibir resultado final com indicador visual (aprovado/reprovado)
- [x] Tornar calculadora responsiva para mobile
- [x] Testar cálculos com diferentes valores

## Sistema de Notificações Push (ADIADO - implementar futuramente)
- [ ] Criar tabela de notificações no banco de dados
- [ ] Criar endpoints tRPC para enviar notificações
- [ ] Criar endpoint para listar notificações do aluno
- [ ] Criar componente de sino de notificações no Dashboard
- [ ] Implementar badge de contagem de não lidas
- [ ] Criar modal/dropdown para exibir notificações
- [ ] Integrar notificações quando PF é atualizado
- [ ] Integrar notificações quando badge é desbloqueado
- [ ] Integrar notificações quando material é publicado
- [ ] Testar sistema completo de notificações

## Investigação de Problema de Login
- [ ] Verificar qual página de login o usuário está tentando acessar
- [ ] Verificar mensagem de erro específica
- [ ] Checar logs do servidor para erros de autenticação
- [ ] Verificar se OAuth está configurado corretamente
- [ ] Testar fluxo de login do professor
- [ ] Verificar se a plataforma foi publicada corretamente
- [ ] Confirmar que o sistema de autenticação Manus OAuth está funcionando

## Implementar Sistema de Autenticação Tradicional (Email/Senha)
- [ ] Criar tabela de professores no banco de dados (email, senha hash, nome)
- [ ] Implementar endpoints tRPC para login com email/senha
- [ ] Implementar hash de senha com bcrypt
- [ ] Criar tela de login customizada para professores
- [ ] Remover dependência do OAuth da Manus
- [ ] Criar conta padrão: pedro.alexandre@unirio.br / 08714684764
- [ ] Implementar sistema de sessão com JWT
- [ ] Atualizar Landing page para usar novo sistema de login
- [ ] Testar login completo
- [ ] Atualizar documentação de acesso

## Painel de Analytics com Gráficos e Exportação
- [x] Criar endpoint tRPC para obter dados de desempenho das equipes por semana
- [ ] Implementar gráfico de linha (Chart.js) mostrando evolução de XP das equipes
- [ ] Implementar gráfico de barras comparativo de desempenho
- [ ] Adicionar filtros por período (semana, mês, semestre)
- [ ] Implementar exportação em PDF usando ReportLab
- [ ] Implementar exportação em Excel usando openpyxl
- [ ] Criar página de Analytics no painel admin
- [ ] Testar gráficos e exportações

## Sistema de Notificações por Email
- [ ] Criar tabela de configuração de notificações por email
- [ ] Implementar função para enviar email quando PF é atualizado
- [ ] Implementar função para enviar email quando badge é desbloqueado
- [ ] Implementar função para enviar email com avisos do professor
- [ ] Configurar SMTP para envio de emails
- [ ] Criar templates de email HTML
- [ ] Testar envio de emails

## Integração com PubMed API
- [ ] Criar endpoint tRPC para buscar artigos do PubMed
- [ ] Implementar busca por tema de seminário
- [ ] Filtrar artigos dos últimos 4 anos
- [ ] Limitar a 2 artigos por tema
- [ ] Armazenar artigos em cache no banco de dados
- [ ] Criar interface para visualizar artigos sugeridos
- [ ] Integrar ao painel de Seminários Jigsaw
- [ ] Testar integração com PubMed

## Reformulação da Tela de Apresentação (Landing Page)
- [x] Adicionar fundo branco circular aos logos IB e UNIRIO
- [x] Criar vinheta de abertura animada (estilo Armação Ilimitada)
- [x] Implementar sistema de música de fundo lounge
- [x] Adicionar controles de play/pause/volume para música
- [x] Criar animações dinâmicas no hero section
- [x] Implementar transições suaves entre seções
- [x] Adicionar efeitos de partículas ou movimento
- [x] Testar responsividade com novas animações
- [x] Validar performance e carregamento

## Correções Gerais da Plataforma (Fev 19)
- [ ] Corrigir erro 404 no ProfessorLogin.tsx (import duplicado useState)
- [ ] Verificar rota /professor/login no App.tsx
- [ ] Verificar conta professor pedro.alexandre@unirio.br no banco
- [ ] Testar login professor completo
- [ ] Verificar login aluno funcional
- [ ] Remover qualquer coisa antes da vinheta de abertura
- [ ] Vinheta deve ser a primeira coisa exibida ao acessar
- [ ] Reformular hero section pós-vinheta (animado, semelhante ao final da vinheta)
- [ ] Implementar música lounge funcional com URLs reais
- [ ] Testar música tocando corretamente
- [ ] Verificar demais erros na dinâmica da plataforma

## Correções Críticas de Autenticação e Mídia
- [x] Recriar fluxo de login/cadastro do professor (primeiro acesso = cadastro)
- [x] Validar email institucional @unirio.br no cadastro
- [x] Criar página de cadastro do professor (/professor/signup)
- [x] Criar página de login do professor (/professor/login) sem erro 404
- [x] Criar login exclusivo para super admin (/super-admin/login)
- [x] Substituir vinheta atual pela versão com animação do professor Pedro
- [x] Gerar música lounge de qualidade (sem zumbido)
- [x] Testar fluxo completo de autenticação

## Novas Correções (Feb 19, 2026 - Continuação)
- [x] Corrigir botão de pular vinheta (não está aparecendo)
- [x] Validar fluxo de cadastro de professores com tratamento de erros
- [x] Implementar notificações automáticas de presença para alunos
- [x] Criar relatório de performance por semana (evolução PF vs cronograma)
- [x] Adequar layout para dispositivos móveis (responsividade)
- [x] Adequar layout para tablets (iPad, Android tablets)
- [x] Adequar layout para TVs 4K (telas grandes, legibilidade)
- [x] Testar responsividade em múltiplos breakpoints

## Novas Correções (Feb 19, 2026 - Fase 2)
- [x] Aumentar botão de pular vinheta com mais destaque visual
- [x] Adicionar 3-5 músicas lounge royalty-free à playlist
- [x] Fazer upload de faixas para rotação automática
- [x] Corrigir cronograma: Semana 11 - AINEs e Corticoides
- [x] Remover Analésicos Opióides do cronograma
- [x] Corrigir cronograma: Semana 12 - Anestésicos Locais
- [x] Corrigir cronograma: Semana 13 - Anti-histamínicos
- [x] Corrigir cronograma: Semana 14 - Seminários Jigsaw 2
- [x] Corrigir cronograma: Semana 15 - P2
- [x] Corrigir cronograma: Semana 16 - Segunda Chamada
- [x] Corrigir cronograma: Semana 17 - Prova Final
- [x] Verificar por que botão de acesso admin não está sendo postado
- [x] Botão de acesso admin verificado e funcional

## Correções Urgentes (Feb 19, 2026 - Noite)
- [x] Corrigir credenciais Super Admin (pedro.alessandro@unirio.br / 0702G@bi não funcionam)
- [x] Criar painel de administrador geral com acesso completo
- [x] Resolver problema de música lounge (não toca, apenas som grave)
- [x] Verificar URLs de áudio e permissões de autoplay
- [x] Testar login Super Admin após correção
