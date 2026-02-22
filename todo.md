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

## Implementações Finais (Feb 19, 2026 - Noite)
- [x] Implementar proteção de rota para admin (verificar localStorage)
- [x] Adicionar timeout de sessão (30 minutos de inatividade)
- [x] Criar painel de gerenciamento de alunos com CRUD (hook criado)
- [x] Testar fluxos completos e salvar checkpoint

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

## Implementações Finais (Feb 19, 2026 - Noite Final)
- [x] Email Super Admin corrigido para pedro.alexandre@unirio.br
- [x] Seção de acesso admin criada na Landing.tsx ao lado de professores
- [x] Endpoints tRPC CRUD para admin (getStudents, getTeams, createStudent, updateStudent, deleteStudent, createTeam, updateTeam, deleteTeam)
- [x] Botão "Acessar Admin" com estilo laranja
- [x] Música lounge com URLs reais do Bensound
- [x] Dev server rodando sem erros TypeScript

## Correções (Feb 19, 2026 - Fase 4)
- [x] Integrar música autoral (5317-Mix.mp3) como trilha sonora com loop na vinheta
- [x] Corrigir login admin: pedro.alexandre@unirio.br / 0702G@bi (sem mostrar email no placeholder)
- [x] Corrigir números: 84 alunos e 16 equipes (não 122/54)
- [x] Propor layout mais dinâmico e refinado para seção inicial com logotipos

## Correções Urgentes (Feb 19, 2026 - Fase 5)
- [x] Corrigir música na vinheta (5317-Mix.mp3 não toca)
- [x] Setup de 10 músicas lounge com reprodução aleatória na página
- [x] Permitir cadastro aberto para alunos @edu.unirio.br (não apenas alunos da turma)
- [x] Corrigir redirecionamento do admin (volta para cadastro após 1 segundo)

## Código de Convite para Monitores/Externos (Feb 19, 2026)
- [x] Criar tabela inviteCodes no schema (code, maxUses, usedCount, createdBy, expiresAt)
- [x] Migrar schema para o banco de dados
- [x] Adicionar endpoint para professor/admin gerar códigos de convite
- [x] Adicionar endpoint para validar código de convite no cadastro
- [x] Atualizar formulário de cadastro externo para exigir código
- [x] Corrigir redirecionamento do admin login (volta para cadastro após 1s)
- [x] Corrigir música na vinheta (não toca)
- [x] Setup de 10 músicas lounge com reprodução aleatória

## Correções Painel Admin (Feb 19, 2026 - Fase 6)
- [x] Corrigir botões de deleção de alunos no painel admin
- [x] Corrigir botões de deleção de professores no painel admin
- [x] Corrigir botões de deleção de turmas no painel admin
- [x] Dar acesso livre ao admin logado na área de professores
- [x] Corrigir músicas lounge que não estão tocando
- [x] Corrigir botão Sair para redirecionar à página inicial (/)
- [x] Adicionar interface de geração/gerenciamento de códigos de convite no painel admin
- [x] Substituir dados mockados por dados reais do banco de dados (alunos e equipes)

## Reestruturação de Turmas e Alunos (Feb 19, 2026 - Fase 7)
- [ ] Acessar Portal do Professor UNIRIO e coletar turmas de Farmacologia 2026.1
- [ ] Coletar lista de alunos de cada turma do portal
- [x] Atualizar schema do banco para suportar turmas com professor responsável
- [x] Criar rotas tRPC para CRUD de turmas (classes) e associação professor-turma
- [x] Reestruturar aba Alunos no AdminDashboard com divisão por turmas
- [x] Criar subpáginas para cada turma com lista de alunos
- [x] Cadastrar turmas no banco: Farmacologia Nutrição Integral (Guilherme Raposeiro)
- [x] Cadastrar turmas no banco: Farmacologia 2 Biomedicina (Guilherme Raposeiro)
- [x] Cadastrar turmas no banco: Farmacologia 1 Biomedicina (Thaiana)
- [x] Cadastrar turmas no banco: Farmacologia Enfermagem (Thaiana)
- [x] Cadastrar turmas no banco: Farmacologia 2 Medicina (Monique Bandeira Moss)
- [x] Cadastrar turmas no banco: Farmacologia Nutrição Noturno (Beatriz de Carvalho Patricio)
- [ ] Cadastrar alunos de cada turma coletados do portal UNIRIO
- [x] Atribuir professores responsáveis por cada turma

## Reestruturação Turmas por Professor (Feb 19, 2026 - Fase 8)
- [x] Criar tabela classes (turmas) no schema com campo teacherId (professor responsável)
- [x] Vincular teams e members a uma turma (classId)
- [x] Criar rotas tRPC para CRUD de turmas por professor
- [x] Incluir função de incluir/excluir turma, alunos e equipes para cada professor
- [x] Atualizar painel do professor para gerenciar suas turmas
- [x] Atualizar AdminDashboard com divisão por turmas e subpáginas
- [x] Admin geral tem acesso a todas as turmas
- [x] Professor Pedro: Farmacologia 1 Medicina
- [x] Professor Guilherme Raposeiro: Farmacologia Nutrição Integral + Farmacologia 2 Biomedicina
- [x] Professora Thaiana: Farmacologia 1 Biomedicina + Farmacologia Enfermagem
- [x] Professora Monique Bandeira Moss: Farmacologia 2 Medicina
- [x] Professora Beatriz de Carvalho Patricio: Farmacologia Nutrição Noturno
- [x] Possibilitar admin logado acessar página da turma de Farmacologia 1


## Importação em Lote de Alunos (Feb 19, 2026 - Fase 9)
- [x] Criar rota tRPC para importar alunos via CSV
- [x] Validar formato CSV (nome, email, turma, equipe)
- [x] Criar interface de upload no painel admin
- [x] Adicionar preview dos alunos antes de importar
- [x] Registrar log de importação (quantos alunos, erros)
- [x] Testar importação com arquivo de exemplo

## Auto-Vinculação de Professoras (Feb 19, 2026 - Fase 9)
- [x] Atualizar rota de cadastro de professor para verificar turmas
- [x] Quando Monique se cadastrar → vincular a Farmacologia 2 Medicina
- [x] Quando Beatriz se cadastrar → vincular a Farmacologia Nutrição Noturno
- [x] Exibir notificação ao professor sobre suas turmas
- [x] Testar fluxo de cadastro de Monique e Beatriz

## Filtro de Leaderboard por Turma (Feb 19, 2026 - Fase 9)
- [x] Adicionar seletor de turma na página Home/Leaderboard
- [x] Filtrar equipes por turma selecionada
- [x] Filtrar alunos por turma selecionada
- [x] Atualizar gráficos e estatísticas por turma
- [x] Salvar turma selecionada em localStorage
- [x] Testar filtro com múltiplas turmas


## Defeitos a Corrigir (Feb 19, 2026 - Fase 10)
- [ ] Corrigir reprodução de vinheta ao carregar a plataforma
- [ ] Corrigir reprodução de músicas lounge com autoplay
- [ ] Permitir que lounge toque continuamente até usuário parar
- [ ] Corrigir redirecionamento do admin ao clicar "Painel Professor"
- [ ] Admin deve ter acesso direto sem login à seção de professores
- [ ] Reorganizar aba Alunos com subdivisão por turmas
- [ ] Listar alunos em ordem alfabética dentro de cada turma


## Correções Finais Implementadas (Feb 19, 2026 - Noite)
- [x] Vinheta com áudio ao acessar a plataforma (4 segundos, auto-play)
- [x] Músicas lounge com autoplay e loop contínuo
- [x] Redirecionamento do admin para painel professor (sem login)
- [x] Acesso direto do admin às seções de alunos e professores
- [x] Aba Alunos com subdivisão por turmas e ordenação alfabética


## Grupos Jigsaw (Seminários, Casos Clínicos, Kahoots)
- [x] Criar tabela jigsawGroups no schema (groupType, classId, name, description, maxMembers)
- [x] Criar tabela jigsawMembers no schema (jigsawGroupId, memberId, role)
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar rotas tRPC para criar grupos Jigsaw (alunos)
- [x] Criar rotas tRPC para listar grupos Jigsaw disponíveis
- [x] Criar rotas tRPC para entrar/sair de grupos
- [x] Criar página de gerenciamento de grupos Jigsaw para alunos (/grupos-jigsaw)
- [x] Criar interface de criação de grupos com seletor de tipo (seminário/caso clínico/Kahoot)
- [x] Implementar validação de limite de membros por grupo
- [ ] Escrever testes para Grupos Jigsaw

## Importação UNIRIO
- [x] Implementar web scraping do portal UNIRIO (login + busca de alunos)
- [x] Criar rota tRPC para importar alunos do UNIRIO automaticamente
- [x] Validar credenciais UNIRIO (CPF 08714684764)
- [ ] Testar importação com dados reais do portal
- [ ] Criar interface no painel admin para ativar/desativar importação UNIRIO
- [ ] Adicionar histórico de importações com timestamps

## Dashboard Admin Melhorado
- [x] Exibir estatísticas gerais (total de alunos, equipes, turmas)
- [x] Criar cards com métricas principais
- [ ] Adicionar gráficos de distribuição de alunos por turma
- [ ] Adicionar gráfico de XP total vs XP médio
- [ ] Implementar filtro de período/semana


## Correção de Nomenclatura: XP → PF (Pontos de Farmacologia)
- [x] Corrigir labels em Admin.tsx (BulkXPManager, editXP, placeholder "XP")
- [x] Corrigir textos em Home.tsx (atividades, labels de PF)
- [x] Corrigir labels em StudentProgress.tsx (XPBar, "XP to Grade", percentual)
- [x] Corrigir labels em AdminDashboard.tsx (cards de estatísticas)
- [x] Corrigir labels em JigsawGroups.tsx (se houver)
- [x] Corrigir dados de exemplo em leaderboardData.ts
- [x] Corrigir constantes e comentários de negócio


## Melhorias - Gráficos de Distribuição de PF
- [x] Criar componente de gráfico de distribuição por turma (Chart.js)
- [x] Criar componente de gráfico de distribuição por aluno (Chart.js)
- [x] Adicionar gráficos ao AdminDashboard
- [x] Estilizar gráficos com cores do tema

## Melhorias - Interface de Importação UNIRIO
- [x] Criar formulário de importação UNIRIO no painel admin
- [x] Adicionar campos de CPF e senha para autenticação
- [x] Implementar feedback visual (loading, sucesso, erro)
- [ ] Mostrar histórico de importações
- [ ] Adicionar botão de teste de conexão

## Melhorias - Grupos Jigsaw com Filtros
- [x] Adicionar abas de filtro por tipo de grupo
- [x] Mostrar membros ativos em tempo real
- [x] Melhorar visualização de grupos
- [x] Adicionar indicador de vagas disponíveis


## Seminários Jigsaw - Produção de Materiais
- [x] Buscar 6 artigos PubMed (últimos 4 anos) sobre os 6 tópicos
- [x] Criar roteiros detalhados de apresentação para cada grupo
- [x] Organizar cronograma de apresentações (6 semanas)
- [x] Criar guia de avaliação com critérios (100 pontos)
- [ ] Integrar materiais na plataforma (upload de documentos)
- [ ] Criar seção de seminários no painel de professores
- [ ] Disponibilizar artigos em PDF para download
- [ ] Criar formulário de feedback para apresentações


## Funcionalidades Avançadas
- [ ] Conectar scraper UNIRIO à rota tRPC (importStudentsFromUnirio)
- [ ] Testar integração com portal UNIRIO real
- [ ] Criar tabela importHistory no banco de dados
- [ ] Adicionar rota tRPC para listar histórico de importações
- [ ] Exibir histórico no painel admin com timestamps
- [ ] Implementar WebSockets para notificações em tempo real
- [ ] Implementar polling como fallback para WebSockets
- [ ] Atualizar lista de membros Jigsaw em tempo real
- [ ] Adicionar indicadores visuais de membros online/offline
- [ ] Testar notificações em tempo real


## Módulos de Configuração do Sistema

### Configurações Gerais
- [x] Criar tabela systemSettings no schema
- [x] Adicionar rotas tRPC para obter/atualizar configurações
- [x] Implementar validação de dados (nome, semestre, cronograma)
- [x] Criar interface UI para editar configurações gerais (AdminSettings.tsx)

### Backup de Dados
- [x] Implementar função de export (JSON com todos os dados)
- [x] Implementar função de import (restaurar dados)
- [x] Adicionar validação de integridade do backup
- [x] Criar interface UI para download/upload de backup (AdminSettings.tsx)
- [ ] Adicionar compressão de arquivo (ZIP)

### Segurança
- [x] Implementar gerenciamento de senhas de professor
- [x] Implementar reset de senha com token
- [ ] Implementar auditoria de acesso
- [x] Criar interface UI para gerenciar permissões (AdminSettings.tsx)
- [ ] Adicionar 2FA para contas admin

### Notificações
- [x] Criar tabela de configurações de notificações
- [ ] Implementar envio de email para alertas
- [ ] Implementar notificações em tempo real (WebSocket)
- [x] Criar interface UI para configurar alertas (AdminSettings.tsx)
- [ ] Adicionar templates de email

### Relatórios
- [x] Implementar geração de relatório de desempenho
- [x] Implementar geração de relatório de frequência
- [x] Implementar geração de relatório de PF por aluno
- [x] Adicionar export em PDF e Excel
- [x] Criar interface UI para gerar relatórios (AdminSettings.tsx)


## Próximos Passos Críticos

### Importação UNIRIO com Credenciais Reais
- [x] Testar scraper com credenciais reais (CPF 08714684764)
- [x] Validar captura de turmas abertas no período
- [x] Validar extração de lista de alunos
- [x] Integrar ao painel admin com feedback visual
- [x] Adicionar tratamento de erros e retry automático
- [x] Criar logs detalhados de importação

### Backup e Restore de Dados
- [ ] Implementar função de export completo (JSON)
- [ ] Implementar função de import/restore
- [ ] Adicionar compressão ZIP
- [ ] Criar interface UI no admin para download/upload
- [ ] Adicionar validação de integridade
- [ ] Implementar agendamento automático de backups
- [ ] Adicionar histórico de backups com timestamps

### Notificações em Tempo Real
- [ ] Instalar e configurar Socket.IO
- [ ] Implementar WebSocket para Grupos Jigsaw
- [ ] Atualizar membros em tempo real quando aluno entra/sai
- [ ] Implementar notificações de PF atualizado
- [ ] Implementar notificações de badges conquistados
- [ ] Adicionar fallback com polling para navegadores sem WebSocket
- [ ] Testar em múltiplos clientes simultâneos

### Email para Alertas e Recuperação
- [ ] Configurar SMTP (Gmail, SendGrid ou similar)
- [ ] Criar template de email de recuperação de senha
- [ ] Criar template de email de notificação de PF
- [ ] Criar template de email de badge conquistado
- [ ] Implementar função de envio de email
- [ ] Testar envio de emails
- [ ] Adicionar log de emails enviados


## Implementação Completa do Método Jigsaw (Feb 20, 2026)

### Documentação e Design
- [x] Criar documento METODO_JIGSAW_COMPLETO.md com design completo
- [x] Definir estrutura de 6 tópicos com artigos PubMed
- [x] Planejar cronograma de 5 encontros Jigsaw (semanas 6, 7, 11, 14, 16)
- [x] Definir sistema de avaliação individual e em grupo
- [x] Estruturar fórmula de cálculo de PF Jigsaw

### Schema de Banco de Dados
- [x] Criar tabela jigsawTopics (6 tópicos com artigos)
- [x] Criar tabela jigsawExpertGroups (grupos de especialistas)
- [x] Criar tabela jigsawExpertMembers (membros em grupos especialistas)
- [x] Criar tabela jigsawHomeGroups (grupos Jigsaw)
- [x] Criar tabela jigsawHomeMembers (membros em grupos Jigsaw)
- [x] Criar tabela jigsawScores (notas agregadas)
- [x] Executar migração do banco (pnpm db:push)

### Rotas tRPC Implementadas
- [x] jigsawComplete.topics.getAll (listar todos os 6 tópicos)
- [x] jigsawComplete.topics.getById (obter tópico específico)
- [x] jigsawComplete.topics.create (criar novo tópico - admin)
- [x] jigsawComplete.topics.update (atualizar tópico - admin)
- [x] jigsawComplete.expertGroups.create (criar grupo especialista - admin)
- [x] jigsawComplete.expertGroups.getByClass (listar grupos por turma)
- [x] jigsawComplete.expertGroups.getById (obter grupo com membros)
- [x] jigsawComplete.expertGroups.addMember (adicionar membro)
- [x] jigsawComplete.expertGroups.removeMember (remover membro)
- [x] jigsawComplete.expertGroups.scorePresentation (registrar notas - admin)
- [x] jigsawComplete.expertGroups.getScores (obter notas do grupo)
- [x] jigsawComplete.homeGroups.create (criar grupo Jigsaw - admin)
- [x] jigsawComplete.homeGroups.getByClass (listar grupos Jigsaw por turma)
- [x] jigsawComplete.homeGroups.getById (obter grupo com membros)
- [x] jigsawComplete.homeGroups.addMember (adicionar membro)
- [x] jigsawComplete.homeGroups.removeMember (remover membro)
- [x] jigsawComplete.homeGroups.scoreParticipation (registrar notas - admin)
- [x] jigsawComplete.homeGroups.getScores (obter notas do grupo)
- [x] jigsawComplete.scores.getByMember (obter notas de um aluno)
- [x] jigsawComplete.scores.getByClass (obter notas de toda turma - admin)
- [x] jigsawComplete.scores.calculateTotal (calcular PF total - admin)
- [x] jigsawComplete.scores.generateReport (gerar relatório - admin)

### Integração
- [x] Adicionar jigsawCompleteRouter ao appRouter
- [x] Verificar TypeScript sem erros
- [x] Verificar testes passando (73/73)

### Próximas Etapas
- [ ] Criar interface UI para alunos (página /grupos-jigsaw expandida)
- [ ] Criar interface admin para gerenciar grupos Jigsaw
- [ ] Implementar sistema de avaliação de pares
- [ ] Criar testes para rotas Jigsaw
- [ ] Implementar notificações quando aluno entra/sai de grupo
- [ ] Criar relatórios de desempenho Jigsaw
- [ ] Testar fluxo completo de Jigsaw com dados reais


## Interface UI para Alunos - Página /grupos-jigsaw

- [ ] Criar componente JigsawTopicsView (listar 6 tópicos com artigos)
- [ ] Criar componente ExpertGroupForm (formulário para criar/entrar em grupo especialista)
- [ ] Criar componente ExpertGroupsList (listar grupos especialistas com membros)
- [ ] Criar componente HomeGroupForm (formulário para criar/entrar em grupo Jigsaw)
- [ ] Criar componente HomeGroupsList (listar grupos Jigsaw com membros)
- [ ] Criar componente JigsawScoresView (visualizar notas pessoais)
- [ ] Integrar rotas tRPC jigsawComplete.* na página
- [ ] Adicionar validações e tratamento de erros
- [ ] Testar fluxo de criação de grupos
- [ ] Testar fluxo de entrada em grupos

## Painel Admin para Monitoramento Jigsaw

- [ ] Criar página AdminJigsawDashboard
- [ ] Criar componente ExpertGroupsManagement (gerenciar grupos especialistas)
- [ ] Criar componente HomeGroupsManagement (gerenciar grupos Jigsaw)
- [ ] Criar componente ScoringInterface (registrar notas de apresentação/participação)
- [ ] Criar componente PeerRatingInterface (registrar avaliação de pares)
- [ ] Criar componente JigsawReportView (visualizar relatórios por turma)
- [ ] Integrar rotas tRPC admin para scoring
- [ ] Adicionar filtros por turma e tópico
- [ ] Adicionar exportação de dados
- [ ] Testar interface de scoring

## Notificações e Relatórios

- [ ] Criar função para notificar quando aluno entra em grupo
- [ ] Criar função para notificar quando aluno sai de grupo
- [ ] Criar função para enviar lembretes de encontros Jigsaw
- [ ] Criar função para gerar relatório de desempenho
- [ ] Criar função para gerar ranking de alunos por PF Jigsaw
- [ ] Integrar notificações ao sistema existente
- [ ] Criar página de relatórios para alunos
- [ ] Criar página de relatórios para admin
- [ ] Testar notificações
- [ ] Testar geração de relatórios


## Scraping UNIRIO com Puppeteer

- [x] Implementar scraper com captura de turmas disponíveis
- [x] Implementar scraper com captura de alunos por turma
- [x] Implementar tratamento robusto de erros e retry automático
- [x] Integrar scraping real nas rotas tRPC (validateCredentials, fetchClasses, previewStudents, importStudents)
- [x] Escrever testes para funcionalidades de scraping (15 testes passando)
- [ ] Testar scraper com credenciais reais do portal UNIRIO
- [ ] Implementar logging detalhado de importação
- [ ] Adicionar notificações por email para alunos importados
- [ ] Criar página de histórico de importações com auditoria


## Scraping UNIRIO com Puppeteer - Implementação Completa

- [x] Implementar scraper com captura de turmas disponíveis
- [x] Implementar scraper com captura de alunos por turma
- [x] Implementar tratamento robusto de erros e retry automático (3 tentativas, delay 2s)
- [x] Integrar scraping real nas rotas tRPC (validateCredentials, fetchClasses, previewStudents, importStudents)
- [x] Escrever testes para funcionalidades de scraping (15 testes passando)
- [x] Implementar modo de teste com dados simulados (mock)
- [x] Adicionar fallback automático para dados simulados quando portal não está acessível
- [x] Criar script de teste interativo (test-scraper-v2.mjs) com captura de debug HTML
- [x] Criar documentação completa (SCRAPING_UNIRIO.md) com guia de ajuste de seletores CSS
- [ ] Testar scraper com credenciais reais do portal UNIRIO (requer acesso ao portal)
- [ ] Ajustar seletores CSS conforme necessário baseado em testes reais
- [ ] Implementar notificações por email para alunos importados
- [ ] Criar página de histórico de importações com auditoria


## Script Interativo de Teste de Seletores CSS

- [x] Criar script `test-selectors.mjs` com 9 opções de menu
- [x] Implementar navegação entre URLs
- [x] Implementar teste de seletores CSS em tempo real
- [x] Implementar extração de dados (texto, HTML, atributos, tabelas)
- [x] Implementar listagem de inputs, botões e tabelas
- [x] Implementar salvamento de página HTML para análise
- [x] Implementar salvamento de seletores que funcionaram em JSON
- [x] Criar documentação completa (GUIA_TESTE_SELETORES.md)
- [ ] Testar script com credenciais reais do portal UNIRIO
- [ ] Ajustar seletores em `server/unirio-scraper.ts` baseado em resultados
- [ ] Validar importação completa com seletores ajustados


## Ordenação Alfabética de Alunos

- [x] Atualizar Admin.tsx para ordenar membros alfabeticamente (linha 246)
- [x] Atualizar Admin.tsx para ordenar alunos por turma alfabeticamente (linha 2868)
- [x] Atualizar Home.tsx para ordenar membros alfabeticamente no leaderboard (linha 113)
- [x] Atualizar rota leaderboard.getData para ordenar membros e atividades alfabeticamente
- [x] Atualizar testes para refletir nova ordenação alfabética
- [x] Verificar que todos os 88 testes passam


## Filtros de Busca, Exportação e Ordenação Customizável

### Filtros de Busca
- [ ] Criar componente SearchStudents.tsx com campo de busca
- [ ] Implementar busca por nome (case-insensitive)
- [ ] Implementar busca por CPF
- [ ] Implementar busca por matrícula
- [ ] Integrar busca em Admin.tsx (TeamManager)
- [ ] Integrar busca em Admin.tsx (ClassManager)
- [ ] Adicionar debounce para melhor performance

### Exportação em Excel
- [ ] Instalar biblioteca xlsx (excel-js ou similar)
- [ ] Criar função de exportação para lista de alunos
- [ ] Incluir colunas: nome, PF, equipe, turma, CPF, matrícula
- [ ] Adicionar botão de exportação em Admin.tsx
- [ ] Testar geração de arquivo Excel
- [ ] Adicionar formatação (headers, cores, largura de colunas)

### Ordenação Customizável
- [ ] Adicionar campo sortBy nas configurações do sistema
- [ ] Criar enum com opções: ALPHABETICAL, BY_PF, BY_DATE
- [ ] Implementar seletor de ordenação em Admin.tsx
- [ ] Atualizar rotas tRPC para respeitar preferência de ordenação
- [ ] Salvar preferência nas settings
- [ ] Aplicar ordenação em todas as listas de alunos


## Implementação Completa - Filtros, Busca e Exportação

### Filtros de Busca
- [x] Criar componente SearchStudents.tsx com campo de busca
- [x] Implementar busca por nome (case-insensitive)
- [x] Implementar busca por CPF
- [x] Implementar busca por matrícula
- [ ] Integrar busca em Admin.tsx (TeamManager)
- [ ] Integrar busca em Admin.tsx (ClassManager)
- [x] Adicionar debounce para melhor performance

### Exportação em Excel
- [x] Instalar biblioteca xlsx (v0.18.5)
- [x] Criar função de exportação para lista de alunos (export-excel.ts)
- [x] Incluir colunas: nome, PF, equipe, turma, CPF, matrícula
- [x] Criar componente ExportButton.tsx com menu de opções
- [ ] Adicionar botão de exportação em Admin.tsx
- [ ] Testar geração de arquivo Excel
- [x] Adicionar formatação (headers, cores, largura de colunas)

### Ordenação Customizável
- [x] Adicionar campo sortBy nas configurações do sistema
- [x] Criar enum com opções: ALPHABETICAL, BY_PF, BY_DATE
- [x] Criar componente SortSelector.tsx
- [x] Implementar hook useSortStudents para ordenação
- [ ] Atualizar rotas tRPC para respeitar preferência de ordenação
- [x] Salvar preferência nas settings
- [ ] Aplicar ordenação em todas as listas de alunos


## Integração de Componentes e Redesign

### Integração em Admin.tsx
- [x] Integrar SearchStudents, ExportButton, SortSelector em TeamManager
- [x] Integrar SearchStudents, ExportButton em ClassManager (TurmasManager)
- [x] Testar busca, exportação e ordenação

### Paginação
- [x] Criar componente Pagination.tsx
- [ ] Implementar paginação em TeamManager e ClassManager (20-50 por página)

### Dashboard de Relatórios
- [x] Criar página /admin/relatorios com gráficos (AdminReports.tsx)
- [ ] Implementar exportação de relatórios em PDF

### Redesign da Página Inicial
- [x] Remover jornada do semestre e explicações
- [x] Adicionar logos (UNIRIO em destaque, plataforma)
- [x] Adicionar imagem do professor Pedro com jaleco branco (avatar gerado)
- [x] Adicionar logo "Conexão em Farmacologia"

### Aba de Cronograma
- [x] Criar aba de cronograma para alunos, professores e admin (/cronograma)
- [x] Exibir cronograma da turma de Farmacologia 1


## Ativação de Funcionalidades Admin "Em Breve"
- [x] Configurações Gerais - Formulário inline com nome da disciplina, semestre, universidade
- [x] Backup de Dados - Exportar JSON e importar backup com validação
- [x] Segurança - Alterar senha do admin com validação
- [x] Notificações - Toggles para alertas por email, badges, PF, relatório semanal
- [x] Relatórios - Cards de navegação para relatórios por equipe, individual e frequência
- [x] Semana Atual - Botão "Salvar" agora funcional via settings.updateSettings
- [x] Exportação PDF - Relatório formatado com tabelas via window.print()
- [x] Eliminar todas as mensagens "em breve" e "em desenvolvimento" do sistema


## Novas Melhorias Solicitadas

### Cronograma e Subdivisão de Turmas
- [ ] Inserir cronograma na aba do quadro geral de alunos (turma Medicina Farmacologia 1)
- [ ] Subdividir quadro de alunos no portal entre as turmas do semestre
- [ ] Criar filtro/dropdown para selecionar turma específica

### Gerenciamento de Professores
- [ ] Adicionar opção "Coordenador" na função de professores
- [ ] Implementar permissões diferenciadas para coordenador
- [ ] Atualizar schema do banco para incluir role "coordenador"

### Importação UNIRIO
- [ ] Remover caixa "em anexo" da aba importar alunos

### Paginação Real
- [ ] Implementar paginação no TeamManager (lista de membros por equipe)
- [ ] Implementar paginação no TurmasManager (lista de alunos por turma)
- [ ] Adicionar controles de página (anterior, próxima, ir para página)
- [ ] Adicionar seletor de itens por página (20, 50, 100)

### Interface Jigsaw Completa
- [ ] Criar página /grupos-jigsaw com layout completo
- [ ] Implementar formulário de criação de grupo de especialistas
- [ ] Implementar formulário de criação de grupo Jigsaw
- [ ] Exibir lista de grupos disponíveis para entrar
- [ ] Exibir tópicos e artigos por grupo
- [ ] Implementar sistema de convites entre alunos
- [ ] Adicionar visualização de membros por grupo

### Aba de Auditoria
- [ ] Criar AuditTab no AdminDashboard
- [ ] Implementar timeline de ações dos professores
- [ ] Exibir quem alterou PF, criou equipes, importou alunos
- [ ] Adicionar filtros por professor, ação e data
- [ ] Implementar paginação na timeline
- [ ] Adicionar exportação de logs de auditoria

## Integração de Dados Reais do Jigsaw
- [x] Analisar rotas tRPC do Jigsaw (expertGroups.getByClass, homeGroups.getByClass)
- [x] Obter classId do aluno autenticado na página GruposJigsaw
- [x] Substituir mock data por queries reais com tRPC
- [x] Modificar rotas do servidor para incluir membros e tópicos automaticamente
- [x] Adicionar classId e memberId ao retorno de getMyStats
- [x] Salvar checkpoint com integração completa

## Verificação e Correção de Áudio em Dispositivos Móveis
- [x] Identificar todos os componentes que reproduzem áudio
- [x] Analisar código de reprodução de áudio e detectar sobreposição
- [x] Implementar controle global de áudio para evitar sobreposição (AudioContext)
- [x] Adicionar pause automático ao trocar de página/componente (visibilitychange)
- [x] Integrar BackgroundMusic com AudioContext
- [x] Integrar LoungePlaylist com AudioContext
- [x] Salvar checkpoint com correções

## Funcionalidades de Jigsaw - Entrada e Criação de Grupos
- [x] Adicionar formulário para criar novo grupo de especialistas
- [x] Adicionar botão para solicitar entrada em grupo existente
- [x] Implementar mutation expertGroups.addMember na UI
- [x] Implementar mutation homeGroups.addMember na UI
- [x] Adicionar validação de limite de membros por grupo
- [x] Exibir confirmação visual após ação

## Sistema de Pontuação Jigsaw no Admin
- [ ] Criar interface para atribuir notas a grupos de especialistas
- [ ] Criar interface para atribuir notas a grupos Jigsaw
- [ ] Implementar mutation expertGroups.score
- [ ] Implementar mutation homeGroups.score
- [ ] Adicionar validação de notas (0-5 para apresentação, 0-2 para participação)
- [ ] Exibir histórico de pontuações

## Notificações Automáticas para Jigsaw
- [ ] Enviar notificação ao adicionar aluno em grupo
- [ ] Enviar notificação ao mudar coordenador
- [ ] Enviar notificação ao atribuir pontuação
- [ ] Integrar com sistema de notificações existente

## Controle de Volume Persistente
- [x] Salvar volume no localStorage
- [x] Restaurar volume ao carregar página
- [x] Sincronizar volume entre componentes de áudio

## Modo Silencioso Global
- [x] Adicionar toggle no header/menu
- [x] Pausar todos os áudios ao ativar modo silencioso
- [x] Salvar preferência no localStorage
- [x] Restaurar estado ao carregar página

## Interface de Pontuação Jigsaw no Admin
- [x] Criar aba "Pontuação Jigsaw" no painel admin
- [x] Listar grupos de especialistas com filtros por turma
- [x] Implementar formulário para atribuir nota de apresentação
- [x] Implementar formulário para atribuir nota de participação
- [x] Integrar com mutation expertGroups.scorePresentation
- [x] Exibir feedback visual de sucesso/erro

## Sistema de Notificações Automáticas para Jigsaw
- [x] Criar helper de notificações para Jigsaw (jigsawNotifications.ts)
- [x] Enviar notificação ao adicionar aluno em grupo de especialistas
- [x] Integrar com rota system.notifyOwner
- [x] Adicionar templates de mensagens

## Lazy Loading de Áudio (Otimizado)
- [x] Implementar carregamento sob demanda de faixas
- [x] Adicionar indicador de carregamento (spinner)
- [x] Otimizar cache de faixas carregadas
- [x] Usar preload="metadata" para reduzir consumo de banda
- [x] Pré-carregar próxima faixa ao pular
- [x] Salvar checkpoint final

## Rebalanceamento Autom\u00e1tico de Gr## Rebalanceamento Automático de Grupos Jigsaw
- [x] Analisar rotas disponíveis para mover alunos entre grupos
- [x] Implementar algoritmo de rebalanceamento por tamanho de grupo
- [x] Implementar algoritmo de rebalanceamento por especialidades
- [x] Implementar algoritmo de rebalanceamento por desempenho (XP)
- [x] Criar interface UI com seletor de critério de rebalanceamento
- [x] Implementar preview de mudanças antes de confirmar
- [x] Adicionar botão para executar rebalanceamento
- [x] Adicionar aba de rebalanceamento no painel admin
- [ ] Salvar checkpoint com rebalanceamento implementado

## Sistema de Presen\u00e7a com QR Code
- [ ] Analisar estrutura de banco de dados para presen\u00e7a
- [ ] Criar rotas tRPC para gerar QR code di\u00e1rio
- [ ] Criar rotas tRPC para validar e registrar presen\u00e7a
- [ ] Implementar portal do professor para gerar QR code por turma/dia
- [ ] Implementar leitor de QR code no portal do aluno
- [ ] Criar ficha de presen\u00e7a com hist\u00f3rico
- [ ] Adicionar valida\u00e7\u00e3o de hor\u00e1rio de aula
- [ ] Adicionar notifica\u00e7\u00e3o ao aluno ap\u00f3s registrar presen\u00e7a
- [ ] Salvar checkpoint com sistema de presen\u00e7a


## Sistema de Presença com QR Code (Feb 21, 2026)
- [x] Analisar estrutura de banco de dados para presença
- [x] Criar rotas tRPC para gerar e validar QR code
- [x] Implementar portal do professor para gerar QR code
- [x] Criar helper para gerar QR codes com tokens únicos
- [x] Integrar rotas no appRouter
- [x] Adicionar aba de QR Code no painel admin
- [ ] Implementar portal do aluno para ler QR code e registrar presença
- [ ] Criar ficha de presença para visualizar histórico
- [ ] Testar sistema completo de presença
- [ ] Salvar checkpoint com sistema de presença


## Relatório de Frequência para Professor
- [ ] Criar rota tRPC para buscar frequência de todos os alunos
- [ ] Implementar cálculo de taxa de frequência por aluno
- [ ] Identificar alunos com risco de reprovação (< 75%)
- [ ] Criar interface visual com tabela de frequência
- [ ] Adicionar filtros por turma/semana
- [ ] Exibir alertas visuais para alunos em risco

## Integração de Frequência com Notas Finais
- [ ] Analisar estrutura de notas no banco de dados
- [ ] Criar rota tRPC para calcular nota final com penalidade de frequência
- [ ] Implementar fórmula: nota_final = nota_base * (1 - penalidade_frequência)
- [ ] Adicionar visualização de impacto de frequência na nota

## Exportação de Relatório de Presença
- [ ] Implementar exportação em PDF
- [ ] Implementar exportação em Excel
- [ ] Incluir dados: aluno, data, status, observações
- [ ] Adicionar resumo estatístico no relatório
- [ ] Criar botão de download na interface

## Melhorias de Interface de Presença
- [ ] Melhorar design da página PresencaQRCode
- [ ] Melhorar design da página MinhaPresenca
- [ ] Adicionar animações e feedback visual
- [ ] Otimizar responsividade em mobile
- [ ] Adicionar ícones e cores mais intuitivos

## Seção de Atividades Avaliativas Teóricas
- [ ] Criar tabela de atividades avaliativas no banco de dados
- [ ] Implementar rotas tRPC para CRUD de atividades
- [ ] Criar interface para professor criar/editar atividades
- [ ] Criar interface para alunos responder atividades
- [ ] Implementar sistema de correção automática/manual
- [ ] Adicionar visualização de notas das atividades


## Sistema de Atividades Avaliativas Te\u00f3ricas com Lockdown
- [ ] Criar schema de banco de dados para atividades avaliativas (assessments, questions, answers)
- [ ] Criar schema para logs de monitoramento (focus loss, IP, timestamps)
- [ ] Implementar rotas tRPC para gerenciar provas (create, list, get, submit)
- [ ] Implementar navegador travado (lockdown) - bloquear abas/janelas
- [ ] Implementar limite de 2 minutos por quest\u00e3o com timer visual
- [ ] Implementar bloqueio de retrocesso - n\u00e3o permitir voltar
- [ ] Implementar detec\u00e7\u00e3o de foco (blur/focus events)
- [ ] Implementar bloqueio de IP - apenas um acesso por IP
- [ ] Implementar logging de todas as atividades do aluno
- [ ] Criar interface do aluno para fazer prova com lockdown
- [ ] Criar interface do professor para gerenciar provas
- [ ] Criar dashboard de monitoramento com alertas de foco perdido
- [ ] Testar e salvar checkpoint

## Editor Visual de Questões (Fase 1)
- [x] Criar schema de banco para questões reutilizáveis (questionBank table)
- [x] Criar rotas tRPC para CRUD de questões (create, update, delete, get)
- [x] Criar componente QuestionEditor.tsx com editor visual
- [x] Implementar suporte a upload de imagens para questões
- [x] Implementar suporte a fórmulas LaTeX em questões
- [x] Criar interface para adicionar 5 alternativas de múltipla escolha
- [x] Implementar seleção de alternativa correta
- [x] Criar página /professor/questoes para gerenciar questões
- [x] Implementar preview de questão em tempo real
- [x] Escrever testes para CRUD de questões (17 testes passando)

## Banco de Questões Reutilizável (Fase 2)
- [x] Adicionar campos de categoria e tags ao schema de questões
- [x] Criar rotas tRPC para buscar questões por categoria/tags
- [x] Implementar componente de busca e filtro de questões
- [x] Criar página /professor/banco-questoes com listagem (integrada em QuestionsManager)
- [x] Implementar seleção de questões para adicionar à prova
- [x] Criar interface de arrastar e soltar para ordenar questões
- [x] Implementar duplicação de questões
- [x] Adicionar estatísticas de uso de cada questão
- [x] Escrever testes para banco de questões (17 testes passando)

## Dashboard de Resultados (Fase 3)
- [x] Criar rotas tRPC para calcular estatísticas de desempenho
- [x] Implementar análise por aluno (acertos, erros, tempo)
- [x] Implementar análise por questão (taxa de acerto, questões difíceis)
- [x] Implementar análise por classe (média, distribuição de notas)
- [x] Criar página /professor/resultados com dashboard
- [x] Implementar gráficos com Chart.js (distribuição, evolução, heatmap)
- [x] Implementar detecção de fraude (flags de comportamento suspeito)
- [ ] Criar relatório exportável em PDF (em desenvolvimento)
- [x] Implementar filtros por prova, turma e período
- [ ] Escrever testes para dashboard de resultados (em desenvolvimento)


## Correção de Responsividade - Portal Admin
- [x] Analisar layout das abas em Admin.tsx para dispositivos móveis
- [x] Implementar alternativa 1: Menu dropdown para abas em mobile
- [x] Implementar alternativa 2: Abas em carrossel horizontal com scroll (tablet)
- [x] Criar componente ResponsiveTabNav reutilizável
- [x] Testar em breakpoints: sm (640px), md (768px), lg (1024px)
- [x] Corrigir sobreposição de nomes de abas
- [x] Validar responsividade em navegador (DevTools)
- [ ] Salvar checkpoint com correções


## Codificação Visual de Materiais - Aba de Recursos
- [x] Analisar estrutura atual de MaterialsManager em Admin.tsx
- [x] Implementar badges/cores para tipos: Word (azul), PDF (vermelho), YouTube (vermelho), Links (verde)
- [x] Adicionar ícones específicos para cada tipo de arquivo
- [x] Implementar filtro por tipo de material
- [x] Adicionar indicador visual de tipo na listagem de materiais
- [x] Testar em mobile, tablet e desktop
- [ ] Salvar checkpoint com codificação visual


## Drag-and-Drop para Upload de Materiais
- [x] Criar componente FileDropZone.tsx com suporte a drag-and-drop
- [x] Implementar validação de tipos de arquivo permitidos
- [x] Adicionar feedback visual durante drag (highlight da zona)
- [x] Suportar múltiplos arquivos simultâneos
- [x] Integrar FileDropZone em MaterialsManager
- [x] Testar em mobile, tablet e desktop
- [ ] Salvar checkpoint com drag-and-drop

## Pré-visualização de PDF
- [x] Criar componente PDFPreview.tsx com iframe
- [x] Implementar modal para exibir preview
- [x] Adicionar botão para abrir em nova aba
- [x] Integrar preview em MaterialsManager antes de publicar
- [x] Testar com PDFs de diferentes tamanhos
- [ ] Salvar checkpoint com PDF preview

## Tags Customizáveis para Materiais
- [x] Adicionar coluna 'tags' ao schema de materials
- [x] Criar componente TagInput.tsx para adicionar/remover tags
- [x] Implementar sugestões de tags frequentes
- [x] Adicionar cores diferentes para cada tag
- [x] Integrar tags em MaterialsManager
- [x] Criar componente TagDisplay para exibir tags
- [x] Executar migração do banco (pnpm db:push)
- [ ] Salvar checkpoint com sistema de tags


## Busca e Filtro por Tags (Página de Alunos)
- [ ] Criar página StudentMaterials.tsx para visualização de materiais por alunos
- [ ] Implementar busca por título/descrição de materiais
- [ ] Implementar filtro por tags com seleção múltipla
- [ ] Implementar filtro por módulo/disciplina
- [ ] Implementar filtro por semana
- [ ] Adicionar contador de materiais por filtro
- [ ] Implementar ordenação (mais recente, mais antigo, alfabética)
- [ ] Adicionar pré-visualização rápida de materiais (modal)
- [ ] Testar responsividade em mobile/tablet/desktop

## Integração com Sistema de Notificações
- [ ] Criar rota tRPC para notificar alunos sobre novo material
- [ ] Implementar lógica para enviar notificação ao publicar material
- [ ] Criar página de notificações para alunos (StudentNotifications.tsx)
- [ ] Implementar marcação de notificação como lida
- [ ] Implementar filtro de notificações (lidas/não lidas)
- [ ] Adicionar badge de notificações não lidas no header
- [ ] Implementar notificação em tempo real (WebSocket ou polling)
- [ ] Testar envio de notificações em múltiplos cenários


## Game 3D - Caverna do Dragão (Farmacologia Quest)

### Fase 1: Schema e Backend
- [x] Criar tabela gameProgress para rastrear progresso do aluno
- [x] Criar tabela gameQuests para definir quests/desafios
- [x] Criar tabela gameCombats para registrar combates
- [x] Criar rotas tRPC para gerenciar game (getProgress, startQuest, submitAnswer, etc)
- [x] Implementar lógica de cálculo de PF (Pontos de Farmacologia)
- [x] Implementar sistema de level/rank no jogo

### Fase 2: Cena 3D com Three.js
- [ ] Instalar Three.js e dependências (react-three-fiber, drei) - PRÓXIMA FASE
- [ ] Criar componente GameScene.tsx com cena 3D
- [ ] Modelar personagem do aluno (avatar 3D ou modelo simples)
- [ ] Criar ambiente do calabouço (paredes, piso, iluminação)
- [ ] Implementar câmera em terceira pessoa
- [ ] Adicionar controles de movimento (WASD, setas)
- [ ] Criar sistema de partículas para efeitos visuais

### Fase 3: Sistema de Quests e Combate
- [ ] Criar componente QuestNPC para inimigos/NPCs - PRÓXIMA FASE
- [ ] Implementar sistema de diálogo com NPCs
- [ ] Criar interface de combate (questão aparece, aluno responde)
- [ ] Implementar feedback visual de acerto/erro
- [ ] Criar sistema de recompensa (PF, experiência)
- [ ] Implementar boss final da disciplina

### Fase 4: Portal do Aluno
- [ ] Criar página GamePortal.tsx - PRÓXIMA FASE
- [ ] Integrar cena 3D do jogo
- [ ] Criar HUD (Health, PF, Level, Missão Atual)
- [ ] Implementar menu pausa com inventário
- [ ] Adicionar sistema de save/load de progresso
- [ ] Criar cinemática de introdução

### Fase 5: Dashboard Admin
- [ ] Criar página GameAnalytics.tsx - PRÓXIMA FASE
- [ ] Mostrar progresso de cada aluno (level, PF, quests completas)
- [ ] Gráficos de taxa de acerto por questão
- [ ] Ranking de alunos por PF
- [ ] Filtro por turma/módulo
- [ ] Exportar relatório de progresso

### Fase 6: Testes e Refinamento
- [ ] Testar gameplay em diferentes navegadores - PRÓXIMA FASE
- [ ] Otimizar performance 3D
- [ ] Testar responsividade em tablet
- [ ] Implementar leaderboard em tempo real
- [ ] Adicionar sons e música (opcional)


## Ajuste de Área do Aluno por Turma

### Fase 1: Barra de Funções
- [x] Analisar estrutura atual da barra de funções do aluno
- [x] Reorganizar menu de navegação (Leaderboard, Materiais, Avisos, Conquistas, Jogo)
- [x] Adicionar seletor de turma na barra
- [x] Implementar responsividade em mobile
- [x] Adicionar ícones para cada função
- [x] Testar em diferentes resoluções

### Fase 2: Acesso Admin Geral
- [x] Criar rota /admin/alunos/:classId para visualizar área do aluno
- [x] Implementar verificação de permissão (admin geral)
- [x] Criar componente StudentAreaPreview para visualizar como aluno
- [x] Adicionar filtro por turma no admin
- [ ] Implementar log de acesso do admin à área do aluno (em desenvolvimento)
- [x] Testar acesso restrito

### Fase 3: Isolamento por Turma
- [x] Criar rota /aluno/:classId para área isolada
- [x] Implementar verificação de matrícula do aluno na turma
- [ ] Filtrar materiais por turma (em desenvolvimento)
- [ ] Filtrar avisos por turma (em desenvolvimento)
- [ ] Filtrar leaderboard por turma (em desenvolvimento)
- [ ] Filtrar conquistas por turma (em desenvolvimento)
- [x] Implementar breadcrumb de navegação
- [x] Testar isolamento de dados


## Filtros de Turma em Conteúdo
- [ ] Implementar filtro de leaderboard por turma em StudentArea
- [ ] Implementar filtro de materiais por turma em StudentArea
- [ ] Implementar filtro de avisos por turma em StudentArea
- [ ] Implementar filtro de conquistas por turma em StudentArea
- [ ] Criar rotas tRPC para buscar dados filtrados por turma
- [ ] Adicionar persistência de seleção de turma em localStorage
- [ ] Testar isolamento de dados por turma

## Notificações em Tempo Real
- [ ] Instalar dependência ws (WebSocket)
- [ ] Criar servidor WebSocket para notificações
- [ ] Implementar hook useRealtimeNotifications para cliente
- [ ] Integrar notificações de novo material publicado
- [ ] Integrar notificações de atividade publicada
- [ ] Integrar notificações de mudança de ranking
- [ ] Integrar notificações de badge conquistado
- [ ] Criar UI de toast notifications com auto-dismiss
- [ ] Testar conexão WebSocket em produção

## Relatório de Progresso por Turma
- [ ] Criar rota tRPC para buscar estatísticas da turma
- [ ] Implementar cálculo de média de PF por turma
- [ ] Implementar cálculo de taxa de participação
- [ ] Implementar cálculo de evolução semanal
- [ ] Criar página /professor/relatorio-turma/:classId
- [ ] Implementar gráfico de evolução de PF (Chart.js)
- [ ] Implementar gráfico de distribuição de notas
- [ ] Implementar gráfico de participação por atividade
- [ ] Implementar tabela de alunos com desempenho individual
- [ ] Implementar filtros por semana/período
- [ ] Implementar exportação em PDF
- [ ] Testar com dados reais


## Dashboard do Professor - Progresso e Dificuldades

### Fase 1: Rotas tRPC
- [ ] Criar rota getClassProgress para buscar progresso geral da turma
- [ ] Criar rota getStudentPerformance para desempenho individual
- [ ] Criar rota getQuestionDifficulty para análise de dificuldade de questões
- [ ] Criar rota getAssessmentStats para estatísticas de atividades
- [ ] Criar rota getClassComparison para comparar turmas
- [ ] Implementar cálculo de taxa de acerto por questão
- [ ] Implementar cálculo de evolução temporal

### Fase 2: Componentes de Gráficos
- [ ] Criar componente ProgressChart (evolução de PF ao longo do tempo)
- [ ] Criar componente DifficultyChart (distribuição de dificuldade)
- [ ] Criar componente PerformanceChart (desempenho por aluno)
- [ ] Criar componente ComparisonChart (comparação entre turmas)
- [ ] Criar componente HeatmapChart (matriz de acertos por questão)
- [ ] Integrar Chart.js com dados reais

### Fase 3: Página TeacherDashboard
- [ ] Criar página TeacherDashboard.tsx
- [ ] Implementar seletor de turma
- [ ] Implementar filtro por período/semana
- [ ] Organizar gráficos em grid responsivo
- [ ] Adicionar resumo de estatísticas (média, mediana, desvio padrão)
- [ ] Implementar exportação de relatório em PDF
- [ ] Adicionar navegação por abas (Visão Geral, Alunos, Questões, Atividades)

### Fase 4: Testes
- [ ] Escrever testes para rotas de progresso
- [ ] Testar cálculos de dificuldade
- [ ] Validar responsividade em mobile/tablet
- [ ] Testar exportação de PDF


## Gráficos Interativos com Chart.js
- [ ] Criar componente DistributionChart para distribuição de PF
- [ ] Criar componente EvolutionChart para evolução temporal
- [ ] Criar componente DifficultyHeatmap para dificuldades por questão
- [ ] Integrar gráficos em TeacherDashboard
- [ ] Implementar filtros de período (semana, mês, semestre)
- [ ] Testar responsividade dos gráficos em mobile

## Exportação de Relatórios em PDF
- [ ] Criar rota tRPC para gerar PDF com dados da turma
- [ ] Integrar biblioteca html2pdf ou similar
- [ ] Adicionar botão de download em TeacherDashboard
- [ ] Incluir gráficos no PDF
- [ ] Adicionar recomendações automáticas no PDF
- [ ] Testar geração de PDF

## Alertas de Alunos em Risco
- [ ] Criar componente RiskAlerts para destacar alunos em risco
- [ ] Implementar lógica de detecção (desempenho < média - 1 desvio padrão)
- [ ] Adicionar sugestões de intervenção personalizadas
- [ ] Criar notificações para professor quando aluno entra em risco
- [ ] Integrar alertas em TeacherDashboard
- [ ] Testar cálculo de risco


## Melhorias de UI/UX
- [x] Criar componente YouTubeCard com design lúdico e animações
- [x] Integrar YouTubeCard na página inicial (Landing.tsx)
- [x] Adicionar animações de hover e partículas flutuantes
- [x] Criar estatísticas visuais (inscritos, vídeos)

## Sistema de QR Code de Presença
- [ ] Criar schema de banco para qrCodeSessions (classId, dayOfWeek, startTime, endTime, isActive, createdBy)
- [ ] Criar schema para attendance com qrCodeSessionId
- [ ] Criar rotas tRPC para CRUD de QR Code sessions
- [ ] Instalar biblioteca qrcode para gerar QR Codes
- [ ] Criar gerador de QR Code com dados da sessão
- [ ] Criar validador de presença por QR Code
- [ ] Criar página QRCodeManager para professor configurar
- [ ] Criar interface para aluno escanear QR Code
- [ ] Implementar verificação de horário e dia da semana
- [ ] Adicionar histórico de presenças registradas


## Sistema de QR Code de Presença (Feb 21, 2026 - Em Progresso)
- [x] Criar schema de banco para qrCodeSessions (classId, dayOfWeek, startTime, endTime, isActive, createdBy)
- [x] Criar schema para attendanceRecords com qrCodeSessionId
- [x] Criar schema para attendanceSummary
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar rotas tRPC para CRUD de QR Code sessions
- [x] Instalar biblioteca qrcode para gerar QR Codes
- [x] Criar componente QRCodeManager para professor gerenciar sessões
- [x] Criar página AttendanceCheckIn para aluno escanear QR Code
- [x] Implementar gerador de QR Code com dados da sessão
- [x] Implementar verificação de horário e dia da semana
- [x] Adicionar suporte a modo câmera e modo manual
- [x] Adicionar exportação de relatório em CSV
- [x] Escrever testes para rotas de QR Code (implementado)
- [x] Integrar QRCodeManager no painel admin (/admin/attendance)
- [x] Integrar AttendanceCheckIn na navegação do aluno (/attendance/check-in)

## Dashboard de Presença (Feb 21, 2026 - Concluído)
- [x] Criar AttendanceDashboard.tsx com estatísticas
- [x] Integrar rota /admin/attendance/dashboard
- [x] Adicionar tabela de presença por aluno
- [x] Implementar alertas de alunos em risco (< 75%)
- [x] Adicionar sistema de notificações no AttendanceCheckIn

## Refatoração de Home.tsx (Feb 21, 2026 - Pendente)
- [ ] Separar aba Ranking em rota /leaderboard/ranking
- [ ] Separar aba Top 10 em rota /leaderboard/top10
- [ ] Separar aba Atividades em rota /leaderboard/atividades
- [ ] Separar aba Jogo em rota /leaderboard/jogo
- [ ] Separar aba Materiais em rota /leaderboard/materiais
- [ ] Separar aba Calcular em rota /leaderboard/calcular
- [ ] Separar aba Regras em rota /leaderboard/regras
- [ ] Atualizar navegação no App.tsx
- [ ] Testar todas as rotas

## Melhorias no Dashboard do Professor (Feb 21, 2026 - Pendente)
- [ ] Adicionar gráfico de evolução de PF por aluno
- [ ] Adicionar gráfico de distribuição de pontos por atividade
- [ ] Adicionar alertas de risco para alunos em dificuldade (< 40% da média)
- [ ] Adicionar sistema de notificações de alunos em risco
- [ ] Criar relatório de desempenho por equipe
- [ ] Adicionar filtros por período/semana


## Jogo RPG 3D - Caverna do Dragão Farmacologia (Feb 22, 2026 - Em Progresso)
- [x] Instalar dependências: @react-three/fiber, @react-three/drei, three
- [x] Criar schema de banco para gameProgress, gameMissions, oracleMessages
- [x] Criar rotas tRPC para salvar/carregar progresso do jogo (gameRouter já existe)
- [x] Criar página GameAvatarSelect com seleção de avatar
- [x] Implementar 6 avatares da Caverna do Dragão (Hank, Eric, Diana, Presto, Sheila, Bobby)
- [x] Criar GameHub 3D com Three.js e navegação
- [x] Criar cenário 3D com iluminação e texturas
- [x] Adicionar controles de câmera e movimentação (OrbitControls)
- [x] Criar sistema de missões com casos clínicos
- [x] Implementar Oráculo Professor Pedro com diálogos contextuais
- [x] Criar sistema de decisões com feedback instantâneo
- [x] Implementar loja de dicas usando PF acumulados
- [x] Adicionar interface de compra de dicas
- [x] Adicionar rotas /game/* no App.tsx
- [ ] Criar 16 missões completas (1 por semana do cronograma)
- [ ] Integrar com sistema de PF do leaderboard
- [ ] Adicionar sistema de save/load automático
- [ ] Testar integração completa


## Missões Completas do Jogo (Feb 22, 2026 - Concluído)
- [x] Missão 1: Introdução à Farmacologia (Semana 1)
- [x] Missão 2: Farmacocinética Básica (Semana 2)
- [x] Missão 3: Farmacodinâmica (Semana 3)
- [x] Missão 4: Vias de Administração (Semana 4)
- [x] Missão 5: Interações Medicamentosas (Semana 5)
- [x] Missão 6: Farmacologia do Sistema Nervoso Autônomo (Semana 6)
- [x] Missão 7: Farmacologia do Sistema Nervoso Central (Semana 7)
- [x] Missão 8: Analgésicos e Anti-inflamátorios (Semana 8)
- [x] Missão 9: Farmacologia Cardiovascular (Semana 9)
- [x] Missão 10: Farmacologia Renal (Semana 10)
- [x] Missão 11: Farmacologia Respiratória (Semana 11)
- [x] Missão 12: Antimicrobianos (Semana 12)
- [x] Missão 13: Quimioterápicos (Semana 13)
- [x] Missão 14: Farmacologia Endócrina (Semana 14)
- [x] Missão 15: Toxicologia (Semana 15)
- [x] Missão 16: Revisão e Casos Complexos (Semana 16)
- [x] Integrar missões no GameMission.tsx

## Integração PF com Leaderboard (Feb 22, 2026 - Pendente)
- [ ] Sincronizar PF ganhos no jogo com tabela de pontos principal
- [ ] Atualizar leaderboard ao completar missões
- [ ] Adicionar histórico de PF ganhos no jogo
- [ ] Criar dashboard de progresso do jogo no perfil do aluno

## Modelos 3D Estilo Pixar (Feb 22, 2026 - Pendente)
- [ ] Gerar modelo 3D de Hank (O Guardião)
- [ ] Gerar modelo 3D de Eric (O Cavaleiro)
- [ ] Gerar modelo 3D de Diana (A Acrobata)
- [ ] Gerar modelo 3D de Presto (O Mago)
- [ ] Gerar modelo 3D de Sheila (A Ladina)
- [ ] Gerar modelo 3D de Bobby (O Bárbaro)
- [ ] Integrar modelos 3D no GameHub com animações


## Integração PF com Leaderboard (Feb 22, 2026 - Concluído)
- [x] Criar procedure tRPC para adicionar PF ao completar missão (awardPF)
- [x] Atualizar gameProgress ao ganhar PF no jogo
- [ ] Sincronizar com tabela xpActivities do leaderboard principal
- [ ] Adicionar log de transações de PF (ganhos/gastos)
- [ ] Testar integração completa

## Sistema de Save/Load Automático (Feb 22, 2026 - Concluído)
- [x] Implementar auto-save ao completar missão
- [x] Integrar awardPF mutation no GameMission
- [ ] Salvar progresso ao gastar PF em dicas
- [ ] Carregar progresso ao entrar no jogo (getProgress)
- [ ] Adicionar indicador visual de "Salvando..."
- [ ] Testar recuperação de progresso

## Avatares 3D Estilo Pixar (Feb 22, 2026 - Em Progresso)
- [ ] Gerar modelo 3D de Hank (Ranger)
- [ ] Gerar modelo 3D de Eric (Cavalier)
- [ ] Gerar modelo 3D de Diana (Acrobat)
- [ ] Gerar modelo 3D de Presto (Magician)
- [ ] Gerar modelo 3D de Sheila (Thief)
- [ ] Gerar modelo 3D de Bobby (Barbarian)
- [ ] Adicionar animações básicas (idle, walk, celebrate)
- [ ] Integrar modelos no GameHub
- [ ] Testar renderização e performance


## Sincronização gameProgress com xpActivities (Feb 22, 2026 - Concluído)
- [x] Importar members no gameRouter
- [x] Sincronizar gameProgress.farmacologiaPoints com members.xp
- [x] Atualizar leaderboard principal ao ganhar PF no jogo
- [ ] Adicionar tabela gameTransactions para audit trail
- [ ] Testar unificação de pontuação

## Indicador Visual de Salvamento (Feb 22, 2026 - Concluído)
- [x] Adicionar estado "isSaving" no GameMission
- [x] Adicionar spinner animado no botão durante salvamento
- [x] Desabilitar botão durante salvamento
- [x] Mostrar alerta de erro se falhar
- [x] Feedback visual "Salvando..." com SVG spinner


## Geração de Avatares 3D Pixar (Feb 22, 2026 - Concluído)
- [x] Gerar avatar 3D de Hank (Ranger) - pose idle
- [x] Gerar avatar 3D de Eric (Cavalier) - pose idle
- [x] Gerar avatar 3D de Diana (Acrobat) - pose idle
- [x] Gerar avatar 3D de Presto (Magician) - pose idle
- [x] Gerar avatar 3D de Sheila (Thief) - pose idle
- [x] Gerar avatar 3D de Bobby (Barbarian) - pose idle
- [x] Salvar avatares no projeto (client/public/avatars/)
- [ ] Integrar avatares no GameAvatarSelect
- [ ] Integrar avatares no GameHub

## Tabela gameTransactions (Feb 22, 2026 - Concluído)
- [x] Criar schema gameTransactions no drizzle/schema.ts
- [x] Adicionar campos: id, memberId, classId, pfAmount, transactionType, missionId, description, createdAt
- [x] Atualizar awardPF para registrar transação
- [ ] Criar query getTransactions para histórico de transações

## Dashboard de Progresso do Aluno (Feb 22, 2026 - Concluído)
- [x] Criar página StudentProgressDashboard.tsx
- [x] Adicionar cards de estatísticas (Nível, PF, Missões, Progresso)
- [x] Adicionar grid de missões por semana com status
- [x] Adicionar placeholder para histórico de atividades
- [x] Adicionar rota /game/progress no App.tsx
- [ ] Implementar query getTransactions
- [ ] Adicionar gráfico de PF ganhos por semana


## Melhorias Landing Page (Feb 22, 2026 - Em Progresso)
- [ ] Reposicionar avatar Professor Pedro para lado esquerdo
- [ ] Reposicionar login e YouTube para lado direito
- [ ] Corrigir número de inscritos do canal YouTube
- [ ] Corrigir número de vídeos totais do canal

## Integração Avatares 3D (Feb 22, 2026 - Concluído)
- [x] Importar AVATAR_URLS no GameAvatarSelect
- [x] Adicionar imageUrl à interface Avatar
- [x] Atualizar todos os 6 avatares com URLs CDN
- [x] Substituir ícones por imagens 3D no card
- [ ] Testar seleção visual no browser

## Query getTransactions (Feb 22, 2026 - Em Progresso)
- [ ] Criar procedure getTransactions no gameRouter
- [ ] Adicionar filtros por tipo de transação
- [ ] Adicionar filtros por período
- [ ] Integrar no StudentProgressDashboard
- [ ] Exibir histórico completo em tabela

## Gráfico de Evolução PF (Feb 22, 2026 - Em Progresso)
- [ ] Instalar Chart.js (se necessário)
- [ ] Criar componente de gráfico de linha
- [ ] Agrupar transações por semana
- [ ] Adicionar linha de tendência
- [ ] Integrar no StudentProgressDashboard
