import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  gameProgress, gameQuests, gameCombats, gameAchievements,
  members, gameTransactions, gameWeeklyReleases, playerAvatars,
  gameErrorReports, questionBank, classes
} from "../../drizzle/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// ─── Helper: find memberId from user openId ───
async function findMemberId(db: any, userId: number): Promise<number | null> {
  // The game uses members table, not users table
  // Try to find a member linked to this user
  const memberRows = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.id, userId))
    .limit(1);
  return memberRows[0]?.id ?? null;
}

// ─── Built-in 16 quests data (used when no DB quests exist) ───
const BUILTIN_QUESTS = [
  {
    id: 1, order: 1, level: 1, weekNumber: 1,
    title: "O Portal da Farmacocinética",
    description: "Para atravessar o portal, responda: Qual é a ordem correta dos processos farmacocinéticos?",
    npcName: "Mestre dos Magos", npcType: "mage" as const,
    questType: "puzzle" as const, difficulty: "easy" as const,
    farmacologiaPointsReward: 50, experienceReward: 100,
    alternatives: [
      { id: "a", text: "Absorção → Distribuição → Metabolismo → Excreção (ADME)", isCorrect: true },
      { id: "b", text: "Distribuição → Absorção → Excreção → Metabolismo", isCorrect: false },
      { id: "c", text: "Metabolismo → Absorção → Distribuição → Excreção", isCorrect: false },
      { id: "d", text: "Excreção → Metabolismo → Distribuição → Absorção", isCorrect: false },
    ],
    explanation: "A ordem correta é ADME: Absorção, Distribuição, Metabolismo e Excreção.",
  },
  {
    id: 2, order: 2, level: 1, weekNumber: 1,
    title: "O Escudo de Sheila e a Barreira Hematoencefálica",
    description: "Meu escudo me protege como a barreira hematoencefálica protege o cérebro. Que característica um fármaco DEVE ter para atravessá-la?",
    npcName: "Sheila", npcType: "warrior" as const,
    questType: "puzzle" as const, difficulty: "easy" as const,
    farmacologiaPointsReward: 75, experienceReward: 150,
    alternatives: [
      { id: "a", text: "Alta polaridade e hidrofilicidade", isCorrect: false },
      { id: "b", text: "Lipofilicidade e baixo peso molecular", isCorrect: true },
      { id: "c", text: "Grande tamanho molecular", isCorrect: false },
      { id: "d", text: "Carga elétrica positiva", isCorrect: false },
    ],
    explanation: "Fármacos lipofílicos e de baixo peso molecular atravessam a BHE mais facilmente.",
  },
  {
    id: 3, order: 3, level: 2, weekNumber: 2,
    title: "O Cajado de Presto e os Receptores",
    description: "Meu cajado se liga a alvos específicos, assim como fármacos se ligam a receptores. Qual tipo de ligação é MAIS FORTE?",
    npcName: "Presto", npcType: "mage" as const,
    questType: "combat" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 100, experienceReward: 200,
    alternatives: [
      { id: "a", text: "Ligação iônica", isCorrect: false },
      { id: "b", text: "Ligação covalente", isCorrect: true },
      { id: "c", text: "Ligação de hidrogênio", isCorrect: false },
      { id: "d", text: "Forças de Van der Waals", isCorrect: false },
    ],
    explanation: "Ligações covalentes são irreversíveis e as mais fortes entre fármaco-receptor.",
  },
  {
    id: 4, order: 4, level: 2, weekNumber: 2,
    title: "O Arco de Hank e a Dose-Resposta",
    description: "Como um arqueiro ajusta a força do arco, médicos ajustam doses. O que é DL50?",
    npcName: "Hank", npcType: "warrior" as const,
    questType: "combat" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 100, experienceReward: 200,
    alternatives: [
      { id: "a", text: "Dose letal para 50% da população", isCorrect: true },
      { id: "b", text: "Dose que causa 50% do efeito máximo", isCorrect: false },
      { id: "c", text: "Dose mínima eficaz", isCorrect: false },
      { id: "d", text: "Dose de manutenção", isCorrect: false },
    ],
    explanation: "DL50 é a dose letal para 50% da população testada. É uma medida de toxicidade.",
  },
  {
    id: 5, order: 5, level: 3, weekNumber: 3,
    title: "O Bastão de Bobby e os Agonistas",
    description: "Meu bastão ativa a força! Qual é a definição correta de um fármaco AGONISTA?",
    npcName: "Bobby", npcType: "warrior" as const,
    questType: "combat" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 125, experienceReward: 250,
    alternatives: [
      { id: "a", text: "Bloqueia receptores sem ativá-los", isCorrect: false },
      { id: "b", text: "Liga-se e ativa receptores produzindo resposta", isCorrect: true },
      { id: "c", text: "Impede ligação de outros fármacos", isCorrect: false },
      { id: "d", text: "Não se liga a receptores", isCorrect: false },
    ],
    explanation: "Agonistas se ligam ao receptor e produzem uma resposta biológica.",
  },
  {
    id: 6, order: 6, level: 3, weekNumber: 3,
    title: "O Escudo de Eric e os Antagonistas",
    description: "Às vezes precisamos BLOQUEAR ameaças. Qual antagonista é usado em overdose de opioides?",
    npcName: "Eric", npcType: "warrior" as const,
    questType: "combat" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 125, experienceReward: 250,
    alternatives: [
      { id: "a", text: "Atropina", isCorrect: false },
      { id: "b", text: "Naloxona", isCorrect: true },
      { id: "c", text: "Flumazenil", isCorrect: false },
      { id: "d", text: "Propranolol", isCorrect: false },
    ],
    explanation: "Naloxona é antagonista competitivo de receptores opioides μ.",
  },
  {
    id: 7, order: 7, level: 4, weekNumber: 4,
    title: "Uni e o Sistema Nervoso Autônomo",
    description: "O SNA tem duas divisões. Qual neurotransmissor é liberado pelos neurônios PARASSIMPÁTICOS pós-ganglionares?",
    npcName: "Uni", npcType: "healer" as const,
    questType: "puzzle" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 150, experienceReward: 300,
    alternatives: [
      { id: "a", text: "Noradrenalina", isCorrect: false },
      { id: "b", text: "Dopamina", isCorrect: false },
      { id: "c", text: "Acetilcolina", isCorrect: true },
      { id: "d", text: "Serotonina", isCorrect: false },
    ],
    explanation: "Neurônios parassimpáticos pós-ganglionares liberam acetilcolina (ACh).",
  },
  {
    id: 8, order: 8, level: 4, weekNumber: 4,
    title: "A Caverna dos Receptores Colinérgicos",
    description: "Vencer Venger requer conhecimento! Qual fármaco é um antagonista MUSCARÍNICO?",
    npcName: "Venger", npcType: "boss" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 200, experienceReward: 400,
    alternatives: [
      { id: "a", text: "Neostigmina", isCorrect: false },
      { id: "b", text: "Atropina", isCorrect: true },
      { id: "c", text: "Succinilcolina", isCorrect: false },
      { id: "d", text: "Pilocarpina", isCorrect: false },
    ],
    explanation: "Atropina é o antagonista muscarínico clássico, bloqueando receptores M1-M5.",
  },
  {
    id: 9, order: 9, level: 5, weekNumber: 5,
    title: "O Castelo dos Adrenérgicos",
    description: "Cada cabeça de Tiamat representa um receptor adrenérgico. Qual receptor, quando ativado, causa BRONCODILATAÇÃO?",
    npcName: "Tiamat", npcType: "boss" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 175, experienceReward: 350,
    alternatives: [
      { id: "a", text: "α1", isCorrect: false },
      { id: "b", text: "α2", isCorrect: false },
      { id: "c", text: "β1", isCorrect: false },
      { id: "d", text: "β2", isCorrect: true },
    ],
    explanation: "Agonistas β2 relaxam o músculo liso brônquico, causando broncodilatação.",
  },
  {
    id: 10, order: 10, level: 5, weekNumber: 5,
    title: "A Floresta dos Anestésicos",
    description: "Na floresta do sono profundo, qual anestésico inalatório é MAIS potente?",
    npcName: "Mestre dos Magos", npcType: "mage" as const,
    questType: "puzzle" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 175, experienceReward: 350,
    alternatives: [
      { id: "a", text: "Óxido nitroso", isCorrect: false },
      { id: "b", text: "Halotano", isCorrect: true },
      { id: "c", text: "Sevoflurano", isCorrect: false },
      { id: "d", text: "Desflurano", isCorrect: false },
    ],
    explanation: "Halotano tem menor CAM (concentração alveolar mínima), logo é mais potente.",
  },
  {
    id: 11, order: 11, level: 6, weekNumber: 6,
    title: "O Labirinto dos Analgésicos",
    description: "No labirinto da dor, qual analgésico NÃO é opioide?",
    npcName: "Hank", npcType: "warrior" as const,
    questType: "puzzle" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 200, experienceReward: 400,
    alternatives: [
      { id: "a", text: "Morfina", isCorrect: false },
      { id: "b", text: "Codeína", isCorrect: false },
      { id: "c", text: "Paracetamol", isCorrect: true },
      { id: "d", text: "Tramadol", isCorrect: false },
    ],
    explanation: "Paracetamol (acetaminofeno) é analgésico não-opioide de ação central.",
  },
  {
    id: 12, order: 12, level: 7, weekNumber: 7,
    title: "A Torre dos Anti-inflamatórios",
    description: "Na torre da inflamação, qual enzima é inibida pelos AINEs?",
    npcName: "Presto", npcType: "mage" as const,
    questType: "combat" as const, difficulty: "medium" as const,
    farmacologiaPointsReward: 225, experienceReward: 450,
    alternatives: [
      { id: "a", text: "Lipoxigenase", isCorrect: false },
      { id: "b", text: "Fosfolipase A2", isCorrect: false },
      { id: "c", text: "Ciclooxigenase (COX)", isCorrect: true },
      { id: "d", text: "Tromboxano sintase", isCorrect: false },
    ],
    explanation: "AINEs inibem as isoformas COX-1 e COX-2 da ciclooxigenase.",
  },
  {
    id: 13, order: 13, level: 8, weekNumber: 8,
    title: "O Pântano dos Antimicrobianos",
    description: "No pântano das infecções, qual antibiótico inibe a síntese da PAREDE CELULAR bacteriana?",
    npcName: "Eric", npcType: "warrior" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 250, experienceReward: 500,
    alternatives: [
      { id: "a", text: "Tetraciclina", isCorrect: false },
      { id: "b", text: "Penicilina", isCorrect: true },
      { id: "c", text: "Eritromicina", isCorrect: false },
      { id: "d", text: "Ciprofloxacino", isCorrect: false },
    ],
    explanation: "β-lactâmicos como penicilina inibem a síntese de peptideoglicano da parede celular.",
  },
  {
    id: 14, order: 14, level: 9, weekNumber: 9,
    title: "A Montanha dos Cardiovasculares",
    description: "No topo da montanha cardíaca, qual classe de fármacos inibe a ECA?",
    npcName: "Todos os Heróis", npcType: "warrior" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 275, experienceReward: 550,
    alternatives: [
      { id: "a", text: "Bloqueadores de canais de cálcio", isCorrect: false },
      { id: "b", text: "β-bloqueadores", isCorrect: false },
      { id: "c", text: "Inibidores da ECA (IECAs)", isCorrect: true },
      { id: "d", text: "Diuréticos tiazídicos", isCorrect: false },
    ],
    explanation: "IECAs (captopril, enalapril) bloqueiam a conversão de Ang I → Ang II.",
  },
  {
    id: 15, order: 15, level: 9, weekNumber: 9,
    title: "O Abismo dos Psicotrópicos",
    description: "No abismo da mente, qual neurotransmissor é AUMENTADO pelos ISRSs?",
    npcName: "Dungeon Master", npcType: "mage" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 300, experienceReward: 600,
    alternatives: [
      { id: "a", text: "Dopamina", isCorrect: false },
      { id: "b", text: "GABA", isCorrect: false },
      { id: "c", text: "Serotonina", isCorrect: true },
      { id: "d", text: "Glutamato", isCorrect: false },
    ],
    explanation: "ISRSs bloqueiam a recaptação de serotonina (5-HT) na fenda sináptica.",
  },
  {
    id: 16, order: 16, level: 10, weekNumber: 10,
    title: "O Portal de Retorno - Boss Final",
    description: "Para abrir o portal de retorno, responda: Qual é o principal órgão de METABOLIZAÇÃO de fármacos?",
    npcName: "Tiamat", npcType: "boss" as const,
    questType: "combat" as const, difficulty: "hard" as const,
    farmacologiaPointsReward: 500, experienceReward: 1000,
    alternatives: [
      { id: "a", text: "Rins", isCorrect: false },
      { id: "b", text: "Fígado", isCorrect: true },
      { id: "c", text: "Intestino", isCorrect: false },
      { id: "d", text: "Pulmões", isCorrect: false },
    ],
    explanation: "O fígado é o principal órgão de metabolização (biotransformação) de fármacos.",
  },
];

// ─── Achievement definitions ───
const ACHIEVEMENT_DEFS = [
  { id: "first_quest", title: "Primeiro Passo", description: "Complete sua primeira missão", icon: "🎯", condition: "quests_completed >= 1", bonus: 10 },
  { id: "five_quests", title: "Aventureiro", description: "Complete 5 missões", icon: "⚔️", condition: "quests_completed >= 5", bonus: 25 },
  { id: "ten_quests", title: "Herói", description: "Complete 10 missões", icon: "🦸", condition: "quests_completed >= 10", bonus: 50 },
  { id: "all_quests", title: "Mestre de Farmacologia I", description: "Complete todas as 16 missões", icon: "👑", condition: "quests_completed >= 16", bonus: 100 },
  { id: "perfect_streak_3", title: "Sequência Perfeita", description: "Acerte 3 questões seguidas", icon: "🔥", condition: "win_streak >= 3", bonus: 15 },
  { id: "perfect_streak_5", title: "Imparável", description: "Acerte 5 questões seguidas", icon: "💥", condition: "win_streak >= 5", bonus: 30 },
  { id: "speed_demon", title: "Velocista", description: "Complete uma missão em menos de 15 segundos", icon: "⚡", condition: "time_under_15", bonus: 20 },
  { id: "pf_100", title: "Coletor de PF", description: "Acumule 100 PF", icon: "💎", condition: "pf >= 100", bonus: 10 },
  { id: "pf_500", title: "Mestre dos PF", description: "Acumule 500 PF", icon: "💰", condition: "pf >= 500", bonus: 25 },
  { id: "pf_1000", title: "Lenda dos PF", description: "Acumule 1000 PF", icon: "🏆", condition: "pf >= 1000", bonus: 50 },
  { id: "farmacocinetica", title: "Mestre da Farmacocinética", description: "Complete missões 1 e 2", icon: "🧪", condition: "quests_1_2", bonus: 20 },
  { id: "farmacodinamica", title: "Mestre da Farmacodinâmica", description: "Complete missões 3 e 4", icon: "🎯", condition: "quests_3_4", bonus: 20 },
  { id: "sna_master", title: "Mestre do SNA", description: "Complete missões 7 e 8", icon: "🧠", condition: "quests_7_8", bonus: 30 },
  { id: "boss_slayer", title: "Caçador de Chefes", description: "Derrote Venger e Tiamat", icon: "🐉", condition: "bosses_defeated", bonus: 50 },
];

export const gameRouter = router({
  // ═══════════════════════════════════════
  // PLAYER ROUTES
  // ═══════════════════════════════════════

  /**
   * Get available quests for the player (respects weekly releases)
   */
  getAvailableQuests: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return BUILTIN_QUESTS.filter(q => q.weekNumber <= 1); // Default: only week 1

      // Check weekly releases for this class
      const releases = await db
        .select()
        .from(gameWeeklyReleases)
        .where(
          and(
            eq(gameWeeklyReleases.classId, input.classId),
            eq(gameWeeklyReleases.isReleased, true)
          )
        );

      if (releases.length === 0) {
        // No releases configured - return week 1 by default
        return BUILTIN_QUESTS.filter(q => q.weekNumber <= 1);
      }

      // Get released week numbers
      const releasedWeeks = releases.map(r => r.weekNumber);
      return BUILTIN_QUESTS.filter(q => releasedWeeks.includes(q.weekNumber));
    }),

  /**
   * Get a specific quest by ID
   */
  getQuestById: publicProcedure
    .input(z.object({ questId: z.number() }))
    .query(async ({ input }) => {
      const quest = BUILTIN_QUESTS.find(q => q.id === input.questId);
      if (!quest) throw new Error("Quest not found");
      return quest;
    }),

  /**
   * Get player's game progress (works with memberId directly)
   */
  getProgress: publicProcedure
    .input(z.object({
      classId: z.number(),
      memberId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const memberId = input.memberId;
      if (!memberId) return null;

      const progress = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      return progress[0] || null;
    }),

  /**
   * Initialize game progress for a student
   */
  initializeProgress: publicProcedure
    .input(z.object({
      classId: z.number(),
      memberId: z.number(),
      characterId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if already exists
      const existing = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new progress
      await db.insert(gameProgress).values({
        memberId: input.memberId,
        classId: input.classId,
        level: 1,
        farmacologiaPoints: 0,
        experience: 0,
        questsCompleted: 0,
        questsTotal: 16,
        currentQuestId: null,
        totalCombats: 0,
        combatsWon: 0,
        combatsLost: 0,
        achievements: "[]",
        isCompleted: false,
        lastPlayedAt: null,
      });

      // Save avatar choice
      if (input.characterId) {
        await db.insert(playerAvatars).values({
          memberId: input.memberId,
          characterId: input.characterId,
        });
      }

      const inserted = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      return inserted[0];
    }),

  /**
   * Submit answer to a quest
   */
  submitAnswer: publicProcedure
    .input(z.object({
      questId: z.number(),
      classId: z.number(),
      memberId: z.number(),
      answer: z.string(), // alternative id: "a", "b", "c", "d"
      timeSpent: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find the quest from built-in data
      const quest = BUILTIN_QUESTS.find(q => q.id === input.questId);
      if (!quest) throw new Error("Quest not found");

      // Check answer
      const correctAlt = quest.alternatives.find(a => a.isCorrect);
      const isCorrect = input.answer === correctAlt?.id;
      const pfEarned = isCorrect ? quest.farmacologiaPointsReward : 0;
      const xpEarned = isCorrect ? quest.experienceReward : 0;

      // Get progress
      const progressRows = await db
        .select()
        .from(gameProgress)
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (!progressRows[0]) throw new Error("Game progress not found");
      const prog = progressRows[0];

      // Update progress
      const updates: any = {
        totalCombats: prog.totalCombats + 1,
        lastPlayedAt: new Date(),
      };

      if (isCorrect) {
        updates.farmacologiaPoints = prog.farmacologiaPoints + pfEarned;
        updates.experience = prog.experience + xpEarned;
        updates.questsCompleted = prog.questsCompleted + 1;
        updates.combatsWon = prog.combatsWon + 1;

        // Level up logic: every 2 quests = 1 level (max 10)
        const newQuestsCompleted = prog.questsCompleted + 1;
        const newLevel = Math.min(Math.ceil(newQuestsCompleted / 2) + 1, 10);
        if (newLevel > prog.level) {
          updates.level = newLevel;
        }

        // Check if game complete
        if (newQuestsCompleted >= 16) {
          updates.isCompleted = true;
        }
      } else {
        updates.combatsLost = prog.combatsLost + 1;
      }

      await db
        .update(gameProgress)
        .set(updates)
        .where(eq(gameProgress.id, prog.id));

      // Log transaction if PF earned
      if (pfEarned > 0) {
        await db.insert(gameTransactions).values({
          memberId: input.memberId,
          classId: input.classId,
          pfAmount: pfEarned,
          transactionType: "quest_complete",
          missionId: input.questId,
          description: `Missão "${quest.title}": +${pfEarned} PF`,
        });

        // Sync with main leaderboard
        const member = await db
          .select()
          .from(members)
          .where(eq(members.id, input.memberId))
          .limit(1);

        if (member[0]) {
          await db
            .update(members)
            .set({ xp: String(parseFloat(member[0].xp) + pfEarned) })
            .where(eq(members.id, input.memberId));
        }
      }

      // Check achievements
      const newAchievements: string[] = [];
      const currentAchievements: string[] = JSON.parse(prog.achievements || "[]");
      const newQC = (prog.questsCompleted || 0) + (isCorrect ? 1 : 0);
      const newPF = (prog.farmacologiaPoints || 0) + pfEarned;

      for (const ach of ACHIEVEMENT_DEFS) {
        if (currentAchievements.includes(ach.id)) continue;
        let earned = false;
        if (ach.id === "first_quest" && newQC >= 1) earned = true;
        if (ach.id === "five_quests" && newQC >= 5) earned = true;
        if (ach.id === "ten_quests" && newQC >= 10) earned = true;
        if (ach.id === "all_quests" && newQC >= 16) earned = true;
        if (ach.id === "pf_100" && newPF >= 100) earned = true;
        if (ach.id === "pf_500" && newPF >= 500) earned = true;
        if (ach.id === "pf_1000" && newPF >= 1000) earned = true;
        if (ach.id === "speed_demon" && isCorrect && input.timeSpent < 15) earned = true;
        if (earned) newAchievements.push(ach.id);
      }

      if (newAchievements.length > 0) {
        const allAchievements = [...currentAchievements, ...newAchievements];
        await db
          .update(gameProgress)
          .set({ achievements: JSON.stringify(allAchievements) })
          .where(eq(gameProgress.id, prog.id));

        // Award bonus PF for achievements
        const bonusPF = newAchievements.reduce((sum, achId) => {
          const ach = ACHIEVEMENT_DEFS.find(a => a.id === achId);
          return sum + (ach?.bonus || 0);
        }, 0);

        if (bonusPF > 0) {
          await db
            .update(gameProgress)
            .set({ farmacologiaPoints: sql`${gameProgress.farmacologiaPoints} + ${bonusPF}` })
            .where(eq(gameProgress.id, prog.id));
        }
      }

      return {
        isCorrect,
        correctAnswer: correctAlt?.id || "",
        correctAnswerText: correctAlt?.text || "",
        explanation: quest.explanation,
        pfEarned,
        xpEarned,
        newAchievements: newAchievements.map(id => ACHIEVEMENT_DEFS.find(a => a.id === id)!),
        message: isCorrect ? "Parabéns! Você venceu o combate!" : "Resposta incorreta. Tente novamente!",
      };
    }),

  /**
   * Get completed quest IDs for a player
   */
  getCompletedQuests: publicProcedure
    .input(z.object({ classId: z.number(), memberId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const combats = await db
        .select({ questId: gameCombats.questId })
        .from(gameCombats)
        .innerJoin(gameProgress, eq(gameCombats.gameProgressId, gameProgress.id))
        .where(
          and(
            eq(gameProgress.memberId, input.memberId),
            eq(gameProgress.classId, input.classId),
            eq(gameCombats.isWon, true)
          )
        );

      return Array.from(new Set(combats.map(c => c.questId)));
    }),

  /**
   * Get all achievements definitions
   */
  getAchievements: publicProcedure.query(() => {
    return ACHIEVEMENT_DEFS;
  }),

  /**
   * Get player avatar
   */
  getAvatar: publicProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(playerAvatars)
        .where(eq(playerAvatars.memberId, input.memberId))
        .limit(1);

      return rows[0] || null;
    }),

  /**
   * Save/update custom avatar
   */
  saveAvatar: publicProcedure
    .input(z.object({
      memberId: z.number(),
      characterId: z.string(),
      skinTone: z.string().optional(),
      hairStyle: z.string().optional(),
      hairColor: z.string().optional(),
      clothingColor: z.string().optional(),
      accessory: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(playerAvatars)
        .where(eq(playerAvatars.memberId, input.memberId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(playerAvatars)
          .set({
            characterId: input.characterId,
            skinTone: input.skinTone || null,
            hairStyle: input.hairStyle || null,
            hairColor: input.hairColor || null,
            clothingColor: input.clothingColor || null,
            accessory: input.accessory || null,
          })
          .where(eq(playerAvatars.memberId, input.memberId));
      } else {
        await db.insert(playerAvatars).values({
          memberId: input.memberId,
          characterId: input.characterId,
          skinTone: input.skinTone || null,
          hairStyle: input.hairStyle || null,
          hairColor: input.hairColor || null,
          clothingColor: input.clothingColor || null,
          accessory: input.accessory || null,
        });
      }

      return { success: true };
    }),

  /**
   * Report error/doubt about a question
   */
  reportError: publicProcedure
    .input(z.object({
      memberId: z.number(),
      classId: z.number(),
      questId: z.number().optional(),
      reportType: z.enum(["error", "doubt", "suggestion"]),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(gameErrorReports).values({
        memberId: input.memberId,
        classId: input.classId,
        questId: input.questId || null,
        reportType: input.reportType,
        description: input.description,
      });

      return { success: true, message: "Relatório enviado com sucesso!" };
    }),

  // ═══════════════════════════════════════
  // RANKING / LEADERBOARD
  // ═══════════════════════════════════════

  /**
   * Get game leaderboard (top players)
   */
  getLeaderboard: publicProcedure
    .input(z.object({
      classId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({
          memberId: gameProgress.memberId,
          memberName: members.name,
          level: gameProgress.level,
          farmacologiaPoints: gameProgress.farmacologiaPoints,
          questsCompleted: gameProgress.questsCompleted,
          combatsWon: gameProgress.combatsWon,
          totalCombats: gameProgress.totalCombats,
          isCompleted: gameProgress.isCompleted,
          achievements: gameProgress.achievements,
        })
        .from(gameProgress)
        .innerJoin(members, eq(gameProgress.memberId, members.id))
        .where(eq(gameProgress.classId, input.classId))
        .orderBy(desc(gameProgress.farmacologiaPoints))
        .limit(input.limit);

      return rows;
    }),

  // ═══════════════════════════════════════
  // TEACHER / ADMIN ROUTES
  // ═══════════════════════════════════════

  /**
   * Get weekly release schedule for a class
   */
  getWeeklyReleases: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const releases = await db
        .select()
        .from(gameWeeklyReleases)
        .where(eq(gameWeeklyReleases.classId, input.classId))
        .orderBy(gameWeeklyReleases.weekNumber);

      return releases;
    }),

  /**
   * Release quests for a specific week (teacher action)
   */
  releaseWeek: publicProcedure
    .input(z.object({
      classId: z.number(),
      weekNumber: z.number(),
      teacherId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get quest IDs for this week
      const questIds = BUILTIN_QUESTS
        .filter(q => q.weekNumber === input.weekNumber)
        .map(q => q.id);

      // Check if release already exists
      const existing = await db
        .select()
        .from(gameWeeklyReleases)
        .where(
          and(
            eq(gameWeeklyReleases.classId, input.classId),
            eq(gameWeeklyReleases.weekNumber, input.weekNumber)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(gameWeeklyReleases)
          .set({
            isReleased: true,
            releasedAt: new Date(),
            releasedBy: input.teacherId || null,
            questIds: JSON.stringify(questIds),
          })
          .where(eq(gameWeeklyReleases.id, existing[0].id));
      } else {
        // Create new
        const weekTitles: Record<number, string> = {
          1: "Farmacocinética (ADME)",
          2: "Farmacodinâmica (Receptores e Dose-Resposta)",
          3: "Agonistas e Antagonistas",
          4: "Sistema Nervoso Autônomo e Colinérgicos",
          5: "Adrenérgicos e Anestésicos",
          6: "Analgésicos",
          7: "Anti-inflamatórios",
          8: "Antimicrobianos",
          9: "Cardiovasculares e Psicotrópicos",
          10: "Boss Final - Revisão Geral",
        };

        await db.insert(gameWeeklyReleases).values({
          classId: input.classId,
          weekNumber: input.weekNumber,
          questIds: JSON.stringify(questIds),
          title: `Semana ${input.weekNumber} - ${weekTitles[input.weekNumber] || "Desafios"}`,
          isReleased: true,
          releasedAt: new Date(),
          releasedBy: input.teacherId || null,
        });
      }

      return { success: true, questIds, message: `Semana ${input.weekNumber} liberada com ${questIds.length} missões!` };
    }),

  /**
   * Lock a week (undo release)
   */
  lockWeek: publicProcedure
    .input(z.object({
      classId: z.number(),
      weekNumber: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(gameWeeklyReleases)
        .set({ isReleased: false })
        .where(
          and(
            eq(gameWeeklyReleases.classId, input.classId),
            eq(gameWeeklyReleases.weekNumber, input.weekNumber)
          )
        );

      return { success: true };
    }),

  /**
   * Get all students' game progress for a class (teacher view)
   */
  getAllProgress: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select({
          id: gameProgress.id,
          memberId: gameProgress.memberId,
          memberName: members.name,
          level: gameProgress.level,
          farmacologiaPoints: gameProgress.farmacologiaPoints,
          experience: gameProgress.experience,
          questsCompleted: gameProgress.questsCompleted,
          questsTotal: gameProgress.questsTotal,
          combatsWon: gameProgress.combatsWon,
          combatsLost: gameProgress.combatsLost,
          totalCombats: gameProgress.totalCombats,
          achievements: gameProgress.achievements,
          isCompleted: gameProgress.isCompleted,
          lastPlayedAt: gameProgress.lastPlayedAt,
          createdAt: gameProgress.createdAt,
        })
        .from(gameProgress)
        .innerJoin(members, eq(gameProgress.memberId, members.id))
        .where(eq(gameProgress.classId, input.classId))
        .orderBy(desc(gameProgress.farmacologiaPoints));

      return rows;
    }),

  /**
   * Get error reports for a class (teacher view)
   */
  getErrorReports: publicProcedure
    .input(z.object({
      classId: z.number(),
      status: z.enum(["pending", "reviewed", "resolved", "dismissed", "all"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select({
          id: gameErrorReports.id,
          memberId: gameErrorReports.memberId,
          memberName: members.name,
          questId: gameErrorReports.questId,
          reportType: gameErrorReports.reportType,
          description: gameErrorReports.description,
          status: gameErrorReports.status,
          teacherResponse: gameErrorReports.teacherResponse,
          createdAt: gameErrorReports.createdAt,
        })
        .from(gameErrorReports)
        .innerJoin(members, eq(gameErrorReports.memberId, members.id))
        .where(eq(gameErrorReports.classId, input.classId))
        .orderBy(desc(gameErrorReports.createdAt));

      const rows = await query;

      if (input.status !== "all") {
        return rows.filter((r: any) => r.status === input.status);
      }

      return rows;
    }),

  /**
   * Respond to an error report (teacher action)
   */
  respondToReport: publicProcedure
    .input(z.object({
      reportId: z.number(),
      status: z.enum(["reviewed", "resolved", "dismissed"]),
      teacherResponse: z.string().optional(),
      teacherId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(gameErrorReports)
        .set({
          status: input.status,
          teacherResponse: input.teacherResponse || null,
          resolvedBy: input.teacherId || null,
          resolvedAt: new Date(),
        })
        .where(eq(gameErrorReports.id, input.reportId));

      return { success: true };
    }),

  /**
   * Get game statistics for a class (teacher dashboard)
   */
  getClassStats: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return {
        totalPlayers: 0,
        avgLevel: 0,
        avgPF: 0,
        avgQuestsCompleted: 0,
        completedCount: 0,
        totalCombats: 0,
        winRate: 0,
        pendingReports: 0,
      };

      const allProgress = await db
        .select()
        .from(gameProgress)
        .where(eq(gameProgress.classId, input.classId));

      const pendingReports = await db
        .select({ count: sql<number>`count(*)` })
        .from(gameErrorReports)
        .where(
          and(
            eq(gameErrorReports.classId, input.classId),
            eq(gameErrorReports.status, "pending")
          )
        );

      const totalPlayers = allProgress.length;
      if (totalPlayers === 0) return {
        totalPlayers: 0, avgLevel: 0, avgPF: 0, avgQuestsCompleted: 0,
        completedCount: 0, totalCombats: 0, winRate: 0, pendingReports: 0,
      };

      const totalCombats = allProgress.reduce((s, p) => s + p.totalCombats, 0);
      const totalWins = allProgress.reduce((s, p) => s + p.combatsWon, 0);

      return {
        totalPlayers,
        avgLevel: +(allProgress.reduce((s, p) => s + p.level, 0) / totalPlayers).toFixed(1),
        avgPF: +(allProgress.reduce((s, p) => s + p.farmacologiaPoints, 0) / totalPlayers).toFixed(1),
        avgQuestsCompleted: +(allProgress.reduce((s, p) => s + p.questsCompleted, 0) / totalPlayers).toFixed(1),
        completedCount: allProgress.filter(p => p.isCompleted).length,
        totalCombats,
        winRate: totalCombats > 0 ? +((totalWins / totalCombats) * 100).toFixed(1) : 0,
        pendingReports: Number(pendingReports[0]?.count || 0),
      };
    }),

  /**
   * Get all builtin quests (for admin reference)
   */
  getAllQuests: publicProcedure.query(() => {
    return BUILTIN_QUESTS;
  }),
});
