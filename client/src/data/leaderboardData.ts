/*
 * =====================================================
 * CONEXÃO EM FARMACOLOGIA - DADOS DO LEADERBOARD
 * Farmacologia I (2026.1) - UNIRIO
 * =====================================================
 * INSTRUÇÕES PARA O PROFESSOR:
 * Para atualizar os dados, basta editar os valores de PF
 * neste arquivo. O leaderboard será atualizado automaticamente.
 * =====================================================
 * PF = Pontos Farmacológicos
 * =====================================================
 */

export interface TeamMember {
  name: string;
  pf: number;
}

export interface Team {
  id: number;
  name: string;
  emoji: string;
  color: string;
  members: TeamMember[];
}

export interface WeeklyHighlight {
  week: number;
  date: string;
  activity: string;
  topTeam: string;
  topStudent: string;
  description: string;
}

export interface PFActivity {
  name: string;
  maxPF: number;
  icon: string;
}

// Atividades que geram PF (Pontos Farmacológicos)
export const pfActivities: PFActivity[] = [
  { name: "Quiz Relâmpago", maxPF: 0.5, icon: "⚡" },
  { name: "Desafio Semanal", maxPF: 1.0, icon: "🎯" },
  { name: "Jigsaw em Sala", maxPF: 2.0, icon: "🧩" },
  { name: "Escape Room", maxPF: 3.0, icon: "🔓" },
  { name: "Seminário Grand Rounds", maxPF: 3.0, icon: "🎤" },
  { name: "Kahoot", maxPF: 1.5, icon: "🏆" },
  { name: "Scavenger Hunt", maxPF: 2.0, icon: "🔍" },
  { name: "Vídeo 'Explique p/ Avó'", maxPF: 5.0, icon: "📹" },
  { name: "Caso Clínico Integrado", maxPF: 2.0, icon: "🏥" },
];

// PF máximo possível no semestre
export const MAX_PF_SEMESTER = 45;

// Dados das 16 equipes
export const teams: Team[] = [
  {
    id: 1, name: "Acetilcolina", emoji: "💊", color: "#3b82f6",
    members: [
      { name: "Ana Silva", pf: 12.5 },
      { name: "Bruno Costa", pf: 11.0 },
      { name: "Carla Mendes", pf: 13.5 },
      { name: "Diego Rocha", pf: 10.0 },
      { name: "Elena Souza", pf: 14.0 },
    ]
  },
  {
    id: 2, name: "Adrenalina", emoji: "💉", color: "#10b981",
    members: [
      { name: "Felipe Alves", pf: 15.0 },
      { name: "Gabriela Lima", pf: 14.5 },
      { name: "Hugo Martins", pf: 13.0 },
      { name: "Isabela Nunes", pf: 16.0 },
      { name: "João Ferreira", pf: 12.5 },
    ]
  },
  {
    id: 3, name: "Dopamina", emoji: "🧬", color: "#06b6d4",
    members: [
      { name: "Karen Oliveira", pf: 11.5 },
      { name: "Lucas Pereira", pf: 10.5 },
      { name: "Maria Santos", pf: 12.0 },
      { name: "Nathan Ribeiro", pf: 9.5 },
      { name: "Olívia Araújo", pf: 13.0 },
    ]
  },
  {
    id: 4, name: "Serotonina", emoji: "🧪", color: "#8b5cf6",
    members: [
      { name: "Pedro Gomes", pf: 14.0 },
      { name: "Quésia Dias", pf: 13.5 },
      { name: "Rafael Cardoso", pf: 12.0 },
      { name: "Sara Monteiro", pf: 15.5 },
      { name: "Thiago Barbosa", pf: 11.0 },
    ]
  },
  {
    id: 5, name: "Histamina", emoji: "🔬", color: "#f59e0b",
    members: [
      { name: "Ursula Campos", pf: 10.0 },
      { name: "Vinícius Teixeira", pf: 9.0 },
      { name: "Wanda Correia", pf: 11.5 },
      { name: "Xavier Moura", pf: 8.5 },
      { name: "Yasmin Pinto", pf: 12.0 },
    ]
  },
  {
    id: 6, name: "Noradrenalina", emoji: "⚗️", color: "#ef4444",
    members: [
      { name: "Zara Fonseca", pf: 13.0 },
      { name: "André Vieira", pf: 12.5 },
      { name: "Bianca Lopes", pf: 14.0 },
      { name: "Caio Nascimento", pf: 11.5 },
      { name: "Daniela Reis", pf: 15.0 },
    ]
  },
  {
    id: 7, name: "GABA", emoji: "🧠", color: "#6366f1",
    members: [
      { name: "Eduardo Azevedo", pf: 9.5 },
      { name: "Fernanda Cruz", pf: 10.0 },
      { name: "Gustavo Machado", pf: 8.0 },
      { name: "Helena Borges", pf: 11.0 },
      { name: "Igor Sampaio", pf: 7.5 },
    ]
  },
  {
    id: 8, name: "Glutamato", emoji: "🧫", color: "#ec4899",
    members: [
      { name: "Juliana Freitas", pf: 12.0 },
      { name: "Kevin Duarte", pf: 11.5 },
      { name: "Larissa Cunha", pf: 13.0 },
      { name: "Marcos Tavares", pf: 10.5 },
      { name: "Natália Ramos", pf: 14.5 },
    ]
  },
  {
    id: 9, name: "Prostaglandina", emoji: "💊", color: "#14b8a6",
    members: [
      { name: "Otávio Melo", pf: 11.0 },
      { name: "Patrícia Soares", pf: 12.5 },
      { name: "Quirino Andrade", pf: 10.0 },
      { name: "Renata Barros", pf: 13.5 },
      { name: "Sérgio Carvalho", pf: 9.0 },
    ]
  },
  {
    id: 10, name: "Endorfina", emoji: "🌟", color: "#f97316",
    members: [
      { name: "Tatiana Moreira", pf: 14.5 },
      { name: "Ulisses Pires", pf: 13.0 },
      { name: "Valéria Guedes", pf: 15.0 },
      { name: "Wesley Brito", pf: 12.0 },
      { name: "Ximena Coelho", pf: 16.5 },
    ]
  },
  {
    id: 11, name: "Insulina", emoji: "💉", color: "#84cc16",
    members: [
      { name: "Yuri Pacheco", pf: 8.5 },
      { name: "Zélia Nogueira", pf: 9.0 },
      { name: "Amanda Leite", pf: 7.0 },
      { name: "Bernardo Faria", pf: 10.5 },
      { name: "Cecília Rocha", pf: 6.5 },
    ]
  },
  {
    id: 12, name: "Cortisol", emoji: "⚡", color: "#a855f7",
    members: [
      { name: "Davi Santana", pf: 11.0 },
      { name: "Elisa Medeiros", pf: 12.0 },
      { name: "Fábio Queiroz", pf: 10.5 },
      { name: "Gisele Alencar", pf: 13.0 },
      { name: "Henrique Lima", pf: 9.5 },
    ]
  },
  {
    id: 13, name: "Atropina", emoji: "🔬", color: "#0ea5e9",
    members: [
      { name: "Ingrid Castro", pf: 13.5 },
      { name: "Jorge Silveira", pf: 12.0 },
      { name: "Karina Vasconcelos", pf: 14.0 },
      { name: "Leonardo Prado", pf: 11.0 },
      { name: "Mônica Esteves", pf: 15.5 },
    ]
  },
  {
    id: 14, name: "Morfina", emoji: "🧪", color: "#d946ef",
    members: [
      { name: "Nélson Aguiar", pf: 10.0 },
      { name: "Olga Fernandes", pf: 11.5 },
      { name: "Paulo Henrique", pf: 9.0 },
      { name: "Rita Cavalcanti", pf: 12.5 },
      { name: "Simone Braga", pf: 8.0 },
    ]
  },
  {
    id: 15, name: "Lidocaína", emoji: "💊", color: "#22d3ee",
    members: [
      { name: "Tiago Mendonça", pf: 12.0 },
      { name: "Úrsula Dantas", pf: 13.5 },
      { name: "Valter Siqueira", pf: 11.0 },
      { name: "Wilma Teles", pf: 14.0 },
      { name: "Xande Portela", pf: 10.5 },
    ]
  },
  {
    id: 16, name: "Omeprazol", emoji: "🧫", color: "#fb923c",
    members: [
      { name: "Yago Rezende", pf: 9.5 },
      { name: "Zilma Fontes", pf: 10.0 },
      { name: "Adriano Maia", pf: 8.0 },
      { name: "Bruna Lacerda", pf: 11.0 },
      { name: "Cláudio Rangel", pf: 7.5 },
    ]
  },
];

// Destaques semanais
export const weeklyHighlights: WeeklyHighlight[] = [
  {
    week: 1, date: "03/03/2026",
    activity: "Aula Inaugural",
    topTeam: "—", topStudent: "—",
    description: "Introdução à Farmacologia, aspectos gerais e importância. Farmacocinética e Farmacodinâmica"
  },
  {
    week: 2, date: "10/03/2026",
    activity: "Farmacocinética",
    topTeam: "—", topStudent: "—",
    description: "Distribuição, Metabolismo e Excreção de fármacos"
  },
  {
    week: 3, date: "17/03/2026",
    activity: "Kahoot 1 + Mecanismo de Ação",
    topTeam: "—", topStudent: "—",
    description: "Kahoot 1: Vias de administração e farmacocinética. Mecanismo de ação e interações medicamentosas"
  },
  {
    week: 4, date: "24/03/2026",
    activity: "CS1: Farmacocinética",
    topTeam: "—", topStudent: "—",
    description: "Boas Práticas de Prescrição + Caso Integrado 1: Farmacocinética (11h)"
  },
  {
    week: 5, date: "31/03/2026",
    activity: "Kahoot 2 + Colinérgicos",
    topTeam: "—", topStudent: "—",
    description: "Colinérgicos de ação direta e anticolinesterásicos. Kahoot 2: Mecanismo de ação e interações"
  },
  {
    week: 6, date: "07/04/2026",
    activity: "Kahoot 3 + Bloqueadores",
    topTeam: "—", topStudent: "—",
    description: "Antagonistas colinérgicos e bloqueadores neuromusculares. Kahoot 3: Agonistas Colinérgicos"
  },
  {
    week: 7, date: "14/04/2026",
    activity: "Seminários Jigsaw 1-3 + CS2",
    topTeam: "—", topStudent: "—",
    description: "Grupos 1-3: Interações medicamentosas, Alergia, Farmacodependência. CS2: Colinérgicos e Bloqueadores (11h)"
  },
  {
    week: 8, date: "28/04/2026",
    activity: "1ª Prova Parcial",
    topTeam: "—", topStudent: "—",
    description: "Primeira avaliação teórica do semestre"
  },
  {
    week: 9, date: "05/05/2026",
    activity: "Adrenérgicos + 2ª Chamada",
    topTeam: "—", topStudent: "—",
    description: "Adrenérgicos e aminas simpaticomimicéticas. 2ª chamada 1ª Prova Parcial (10:30h)"
  },
  {
    week: 10, date: "12/05/2026",
    activity: "Bloqueadores Adrenérgicos",
    topTeam: "—", topStudent: "—",
    description: "Bloqueadores Adrenérgicos"
  },
  {
    week: 11, date: "19/05/2026",
    activity: "Kahoot 3 + Palavra Cruzada 1",
    topTeam: "—", topStudent: "—",
    description: "Antieméticos/AINES/Glicocorticoides. Kahoot 3: Adrenérgicos. Palavra Cruzada 1: Adrenérgicos e Bloqueadores (10:30h)"
  },
  {
    week: 12, date: "26/05/2026",
    activity: "CS3: Adrenérgicos",
    topTeam: "—", topStudent: "—",
    description: "Anestésicos Locais + Caso Integrado 3: Adrenérgicos (10:30h)"
  },
  {
    week: 13, date: "02/06/2026",
    activity: "Seminários Jigsaw 4-6 + Kahoot 4",
    topTeam: "—", topStudent: "—",
    description: "Grupos 4-6: Canabinóides, Choque cardiogênico, Emagrecedores. Kahoot 4: AINES/Corticoides (11h)"
  },
  {
    week: 14, date: "09/06/2026",
    activity: "Palavra Cruzada 2 + CS4",
    topTeam: "—", topStudent: "—",
    description: "Histamina e Anti-histamínicos. Palavra Cruzada 2: Anestésico Local (9:30). CS4: Inflamação e A.L (10:00h)"
  },
  {
    week: 15, date: "16/06/2026",
    activity: "2ª Prova Parcial",
    topTeam: "—", topStudent: "—",
    description: "Segunda avaliação teórica do semestre"
  },
  {
    week: 16, date: "23/06/2026",
    activity: "2ª Chamada",
    topTeam: "—", topStudent: "—",
    description: "Segunda chamada das provas parciais"
  },
  {
    week: 17, date: "30/06/2026",
    activity: "Prova Final",
    topTeam: "—", topStudent: "—",
    description: "Avaliação final do semestre"
  },
];

// Semana atual do semestre
export const currentWeek = 1;

// Informações do curso
export const courseInfo = {
  name: "Farmacologia I",
  code: "MED-2026.1",
  professor: "Prof. Dr.",
  university: "UNIRIO",
  semester: "2026.1",
  totalStudents: 84,
  totalTeams: 16,
};

// Logo e branding
export const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/oUYumbCRVNHBqtNw.png";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Conex%C3%A3oemCi%C3%AAncia-Farmacol%C3%B3gica";
export const PLATFORM_NAME = "Conexão em Farmacologia";
