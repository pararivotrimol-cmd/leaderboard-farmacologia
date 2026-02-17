/*
 * =====================================================
 * LEADERBOARD DATA - FARMACOLOGIA I (2026.1)
 * =====================================================
 * INSTRUÇÕES PARA O PROFESSOR:
 * Para atualizar os dados, basta editar os valores de XP
 * neste arquivo. O leaderboard será atualizado automaticamente.
 * =====================================================
 */

export interface TeamMember {
  name: string;
  xp: number;
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

export interface XPActivity {
  name: string;
  maxXP: number;
  icon: string;
}

// Atividades que geram XP
export const xpActivities: XPActivity[] = [
  { name: "Quiz Relâmpago", maxXP: 0.5, icon: "⚡" },
  { name: "Desafio Semanal", maxXP: 1.0, icon: "🎯" },
  { name: "Jigsaw em Sala", maxXP: 2.0, icon: "🧩" },
  { name: "Escape Room", maxXP: 3.0, icon: "🔓" },
  { name: "Seminário Grand Rounds", maxXP: 3.0, icon: "🎤" },
  { name: "Kahoot", maxXP: 1.5, icon: "🏆" },
  { name: "Scavenger Hunt", maxXP: 2.0, icon: "🔍" },
  { name: "Vídeo 'Explique p/ Avó'", maxXP: 5.0, icon: "📹" },
  { name: "Caso Clínico Integrado", maxXP: 2.0, icon: "🏥" },
];

// XP máximo possível no semestre
export const MAX_XP_SEMESTER = 45;

// Dados das 16 equipes
export const teams: Team[] = [
  {
    id: 1, name: "Acetilcolina", emoji: "💊", color: "#3b82f6",
    members: [
      { name: "Ana Silva", xp: 12.5 },
      { name: "Bruno Costa", xp: 11.0 },
      { name: "Carla Mendes", xp: 13.5 },
      { name: "Diego Rocha", xp: 10.0 },
      { name: "Elena Souza", xp: 14.0 },
    ]
  },
  {
    id: 2, name: "Adrenalina", emoji: "💉", color: "#10b981",
    members: [
      { name: "Felipe Alves", xp: 15.0 },
      { name: "Gabriela Lima", xp: 14.5 },
      { name: "Hugo Martins", xp: 13.0 },
      { name: "Isabela Nunes", xp: 16.0 },
      { name: "João Ferreira", xp: 12.5 },
    ]
  },
  {
    id: 3, name: "Dopamina", emoji: "🧬", color: "#06b6d4",
    members: [
      { name: "Karen Oliveira", xp: 11.5 },
      { name: "Lucas Pereira", xp: 10.5 },
      { name: "Maria Santos", xp: 12.0 },
      { name: "Nathan Ribeiro", xp: 9.5 },
      { name: "Olívia Araújo", xp: 13.0 },
    ]
  },
  {
    id: 4, name: "Serotonina", emoji: "🧪", color: "#8b5cf6",
    members: [
      { name: "Pedro Gomes", xp: 14.0 },
      { name: "Quésia Dias", xp: 13.5 },
      { name: "Rafael Cardoso", xp: 12.0 },
      { name: "Sara Monteiro", xp: 15.5 },
      { name: "Thiago Barbosa", xp: 11.0 },
    ]
  },
  {
    id: 5, name: "Histamina", emoji: "🔬", color: "#f59e0b",
    members: [
      { name: "Ursula Campos", xp: 10.0 },
      { name: "Vinícius Teixeira", xp: 9.0 },
      { name: "Wanda Correia", xp: 11.5 },
      { name: "Xavier Moura", xp: 8.5 },
      { name: "Yasmin Pinto", xp: 12.0 },
    ]
  },
  {
    id: 6, name: "Noradrenalina", emoji: "⚗️", color: "#ef4444",
    members: [
      { name: "Zara Fonseca", xp: 13.0 },
      { name: "André Vieira", xp: 12.5 },
      { name: "Bianca Lopes", xp: 14.0 },
      { name: "Caio Nascimento", xp: 11.5 },
      { name: "Daniela Reis", xp: 15.0 },
    ]
  },
  {
    id: 7, name: "GABA", emoji: "🧠", color: "#6366f1",
    members: [
      { name: "Eduardo Azevedo", xp: 9.5 },
      { name: "Fernanda Cruz", xp: 10.0 },
      { name: "Gustavo Machado", xp: 8.0 },
      { name: "Helena Borges", xp: 11.0 },
      { name: "Igor Sampaio", xp: 7.5 },
    ]
  },
  {
    id: 8, name: "Glutamato", emoji: "🧫", color: "#ec4899",
    members: [
      { name: "Juliana Freitas", xp: 12.0 },
      { name: "Kevin Duarte", xp: 11.5 },
      { name: "Larissa Cunha", xp: 13.0 },
      { name: "Marcos Tavares", xp: 10.5 },
      { name: "Natália Ramos", xp: 14.5 },
    ]
  },
  {
    id: 9, name: "Prostaglandina", emoji: "💊", color: "#14b8a6",
    members: [
      { name: "Otávio Melo", xp: 11.0 },
      { name: "Patrícia Soares", xp: 12.5 },
      { name: "Quirino Andrade", xp: 10.0 },
      { name: "Renata Barros", xp: 13.5 },
      { name: "Sérgio Carvalho", xp: 9.0 },
    ]
  },
  {
    id: 10, name: "Endorfina", emoji: "🌟", color: "#f97316",
    members: [
      { name: "Tatiana Moreira", xp: 14.5 },
      { name: "Ulisses Pires", xp: 13.0 },
      { name: "Valéria Guedes", xp: 15.0 },
      { name: "Wesley Brito", xp: 12.0 },
      { name: "Ximena Coelho", xp: 16.5 },
    ]
  },
  {
    id: 11, name: "Insulina", emoji: "💉", color: "#84cc16",
    members: [
      { name: "Yuri Pacheco", xp: 8.5 },
      { name: "Zélia Nogueira", xp: 9.0 },
      { name: "Amanda Leite", xp: 7.0 },
      { name: "Bernardo Faria", xp: 10.5 },
      { name: "Cecília Rocha", xp: 6.5 },
    ]
  },
  {
    id: 12, name: "Cortisol", emoji: "⚡", color: "#a855f7",
    members: [
      { name: "Davi Santana", xp: 11.0 },
      { name: "Elisa Medeiros", xp: 12.0 },
      { name: "Fábio Queiroz", xp: 10.5 },
      { name: "Gisele Alencar", xp: 13.0 },
      { name: "Henrique Lima", xp: 9.5 },
    ]
  },
  {
    id: 13, name: "Atropina", emoji: "🔬", color: "#0ea5e9",
    members: [
      { name: "Ingrid Castro", xp: 13.5 },
      { name: "Jorge Silveira", xp: 12.0 },
      { name: "Karina Vasconcelos", xp: 14.0 },
      { name: "Leonardo Prado", xp: 11.0 },
      { name: "Mônica Esteves", xp: 15.5 },
    ]
  },
  {
    id: 14, name: "Morfina", emoji: "🧪", color: "#d946ef",
    members: [
      { name: "Nélson Aguiar", xp: 10.0 },
      { name: "Olga Fernandes", xp: 11.5 },
      { name: "Paulo Henrique", xp: 9.0 },
      { name: "Rita Cavalcanti", xp: 12.5 },
      { name: "Simone Braga", xp: 8.0 },
    ]
  },
  {
    id: 15, name: "Lidocaína", emoji: "💊", color: "#22d3ee",
    members: [
      { name: "Tiago Mendonça", xp: 12.0 },
      { name: "Úrsula Dantas", xp: 13.5 },
      { name: "Valter Siqueira", xp: 11.0 },
      { name: "Wilma Teles", xp: 14.0 },
      { name: "Xande Portela", xp: 10.5 },
    ]
  },
  {
    id: 16, name: "Omeprazol", emoji: "🧫", color: "#fb923c",
    members: [
      { name: "Yago Rezende", xp: 9.5 },
      { name: "Zilma Fontes", xp: 10.0 },
      { name: "Adriano Maia", xp: 8.0 },
      { name: "Bruna Lacerda", xp: 11.0 },
      { name: "Cláudio Rangel", xp: 7.5 },
    ]
  },
];

// Destaques semanais
export const weeklyHighlights: WeeklyHighlight[] = [
  {
    week: 1, date: "10/03/2026",
    activity: "Aula Inaugural",
    topTeam: "—", topStudent: "—",
    description: "Apresentação das regras e formação das equipes"
  },
  {
    week: 2, date: "17/03/2026",
    activity: "Jigsaw Farmacocinética + Quiz",
    topTeam: "Adrenalina", topStudent: "Isabela Nunes",
    description: "Primeiro Jigsaw do semestre! Equipe Adrenalina dominou com 8.5 XP"
  },
  {
    week: 3, date: "24/03/2026",
    activity: "Caso Integrado Pneumonia",
    topTeam: "Endorfina", topStudent: "Ximena Coelho",
    description: "Caso interdisciplinar com 4 estações. Ximena acertou todas as questões!"
  },
  {
    week: 4, date: "31/03/2026",
    activity: "Scavenger Hunt + Kahoot 1",
    topTeam: "Serotonina", topStudent: "Sara Monteiro",
    description: "Caça ao tesouro científica! Sara encontrou o artigo-chave em 3 minutos"
  },
  {
    week: 5, date: "07/04/2026",
    activity: "Seminário Jigsaw 1",
    topTeam: "Noradrenalina", topStudent: "Bianca Lopes",
    description: "Primeiro seminário Grand Rounds. Apresentação impecável da equipe Noradrenalina"
  },
];

// Semana atual do semestre
export const currentWeek = 5;

// Informações do curso
export const courseInfo = {
  name: "Farmacologia I",
  code: "MED-2026.1",
  professor: "Prof. Dr.",
  university: "UNIRIO",
  semester: "2026.1",
  totalStudents: 80,
  totalTeams: 16,
};
