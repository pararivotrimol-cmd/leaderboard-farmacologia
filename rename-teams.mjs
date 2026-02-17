import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// 16 nomes de fármacos discutidos no cronograma de Farmacologia I
// Organizados por módulo temático do curso
const teamNames = [
  // Farmacocinética / Farmacodinâmica
  { name: "Paracetamol",     emoji: "💊", color: "#3b82f6" },   // Analgésico clássico
  { name: "Varfarina",       emoji: "🩸", color: "#ef4444" },   // Interações medicamentosas
  // Colinérgicos
  { name: "Pilocarpina",     emoji: "👁️", color: "#22c55e" },   // Agonista colinérgico direto
  { name: "Neostigmina",     emoji: "💪", color: "#14b8a6" },   // Anticolinesterásico
  { name: "Atropina",        emoji: "❤️", color: "#f43f5e" },   // Antagonista muscarínico
  { name: "Succinilcolina",  emoji: "🧊", color: "#6366f1" },   // Bloqueador neuromuscular
  // Adrenérgicos
  { name: "Adrenalina",      emoji: "⚡", color: "#f59e0b" },   // Simpaticomimético
  { name: "Propranolol",     emoji: "🫀", color: "#ec4899" },   // Betabloqueador
  { name: "Fenilefrina",     emoji: "👃", color: "#8b5cf6" },   // Alfa-agonista
  { name: "Noradrenalina",   emoji: "🔥", color: "#f97316" },   // Catecolamina
  // Anti-inflamatórios / Corticoides
  { name: "Ibuprofeno",      emoji: "💥", color: "#06b6d4" },   // AINE
  { name: "Prednisona",      emoji: "🛡️", color: "#84cc16" },   // Glicocorticoide
  // Anestésicos
  { name: "Lidocaína",       emoji: "💉", color: "#a855f7" },   // Anestésico local
  { name: "Bupivacaína",     emoji: "🧪", color: "#0ea5e9" },   // Anestésico local
  // Histamina
  { name: "Loratadina",      emoji: "🤧", color: "#10b981" },   // Anti-histamínico
  // Temas especiais (GT)
  { name: "Naloxona",        emoji: "🚑", color: "#e11d48" },   // Antagonista opioide (drogas de abuso)
];

// Fisher-Yates shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function renameAndRandomize() {
  console.log("🔄 Renomeando equipes e redistribuindo alunos aleatoriamente...\n");

  // 1. Get all current teams
  const [teams] = await db.execute(sql`SELECT id FROM teams ORDER BY id`);
  console.log(`  ✅ ${teams.length} equipes encontradas`);

  // 2. Get all current members
  const [members] = await db.execute(sql`SELECT id, name FROM members ORDER BY id`);
  console.log(`  ✅ ${members.length} alunos encontrados\n`);

  // 3. Rename all 16 teams
  console.log("📝 Renomeando equipes:");
  for (let i = 0; i < teams.length && i < teamNames.length; i++) {
    const team = teams[i];
    const newTeam = teamNames[i];
    await db.execute(
      sql`UPDATE teams SET name = ${newTeam.name}, emoji = ${newTeam.emoji}, color = ${newTeam.color} WHERE id = ${team.id}`
    );
    console.log(`  ${newTeam.emoji} ${newTeam.name} (${newTeam.color})`);
  }

  // 4. Shuffle all students randomly
  const shuffledMembers = shuffle(members);
  console.log(`\n🎲 Alunos embaralhados aleatoriamente!\n`);

  // 5. Redistribute: 4 teams with 6, 12 teams with 5
  // Total: 4*6 + 12*5 = 24 + 60 = 84
  let studentIdx = 0;
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const teamInfo = teamNames[i];
    const membersCount = i < 4 ? 6 : 5;

    console.log(`  ${teamInfo.emoji} ${teamInfo.name} (${membersCount} alunos):`);

    for (let j = 0; j < membersCount && studentIdx < shuffledMembers.length; j++) {
      const student = shuffledMembers[studentIdx];
      await db.execute(
        sql`UPDATE members SET teamId = ${team.id} WHERE id = ${student.id}`
      );
      console.log(`    → ${student.name}`);
      studentIdx++;
    }
  }

  console.log(`\n🎉 Concluído! ${studentIdx} alunos redistribuídos aleatoriamente em 16 equipes!`);
  console.log("   Distribuição: 4 equipes com 6 alunos + 12 equipes com 5 alunos = 84");
  process.exit(0);
}

renameAndRandomize().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
