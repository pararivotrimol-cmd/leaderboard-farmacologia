import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// 84 alunos reais - distribuídos em 16 equipes
// 4 equipes com 6 alunos + 12 equipes com 5 alunos = 24 + 60 = 84
const realStudents = [
  "Alexia Alderete Valdez",
  "Alice Dias Figueiredo",
  "Aline de Mello Freire",
  "Ana Beatriz Souza Barros",
  "Ana Carolina Almeida dos Santos",
  "Ana Julia Gonçalves de Lima",
  "Anne Carolyne Avelino Lopes Domingos",
  "Antonio Carlos Viana Melo",
  "Arthur Campos Nogueira",
  "Arthur Iosca Viero Matos e Ferreira",
  "Arthur Marconsini Ramos",
  "Assiria Haddad",
  "Bernardo Oliveira de Sá",
  "Bruna Calvano de Oliveira",
  "Bruna Lima do Nascimento",
  "Caio de Andrade Leite",
  "Carolina Giesta de Souza Motta",
  "Daniel Leonidas da Silva Brito",
  "Douglas Damasceno de Almeida Lima",
  "Eduarda Sá Bohn",
  "Eduardo Araujo Sena",
  "Eduardo Kneipp Pitta de Castro",
  "Emanuelly da Silva Alegre",
  "Emily Lopes Sant'Anna",
  "Emily Ralf da Silva",
  "Erika Martins Moraes",
  "Evilasio Mesquita Cunha",
  "Fernanda Moreira da Silva",
  "Gabriela Eduarda do Nascimento",
  "Gabrieli Souza dos Santos",
  "Giovanna Sousa Peluso",
  "Gustavo Fernandes do Nascimento",
  "Henrique Moura de Otero",
  "Igor Diogo Pinto Teixeira",
  "Isabella Lucindo Cardoso",
  "Izabella Coeli de Oliveira Dias",
  "Jorge Ricardo Silva de Oliveira",
  "José Lucas Pires Rebelo da Gama",
  "Joshua Nicholas Foord",
  "Ketyllen Victoria Batista dos Santos",
  "Laís da Silva Barbosa",
  "Leandro Abbade Lemos dos Santos",
  "Leandro Bastos Junior",
  "Letícia Navega de Azevedo",
  "Letícia Vitória Linhares Rocha",
  "Luana Braga Pinheiro",
  "Luana do Nascimento Carvalho",
  "Lucas Rezende Silva",
  "Lucas Ribeiro Balbino",
  "Lucas Silva Alexandre",
  "Marcella Venutiano Longo",
  "Marcelo Couto de Mendonça Junior",
  "Marcelo Ferreira Abdala Junior",
  "Maria Cecília Alvim Monteiro Batista Alves",
  "Maria Clara da Costa Emmerick",
  "Maria Eliza Cortez Altomare Oliveira",
  "Maria Fernanda da Silva Seicera",
  "Maria Fernanda Nocera Cruz",
  "Mariana Neves Oliveira",
  "Marina Mendes de Abreu Barbosa",
  "Mário Augusto Fiorellini de Oliveira",
  "Matheus de Oliveira Vitorino",
  "Maurício Lahr Moura Portugal",
  "Miguel Martins",
  "Monique Machado Monnerat Rodrigues Campos",
  "Myllene Abadia de Morais Rosa",
  "Natanael Leonam Quintino da Silva",
  "Natasha de Sena Martins da Silva",
  "Nathalia Mello Souza Pereira",
  "Nathan Coutinho Nunes da Silva",
  "Patrícia Santos da Silva",
  "Paulo Victor Oliveira de Sousa",
  "Pedro Fanara de Souza",
  "Rebeca Lopes Silva Gomes Moreira",
  "Renan de Paula Leite",
  "Ricardo de Souza Cardozo Graça",
  "Ricardo Thomaz da Silva Neto",
  "Sara Caroline Lopes Nogueira",
  "Stephanny Magalhães da Silva Carvalho",
  "Tayana Juvêncio de Oliveira",
  "Tiago da Silva Santos Ferino",
  "Victor Lucas Santos da Silva",
  "Victória Barros dos Santos",
  "Vitor Oliveira Farias",
];

console.log(`Total de alunos: ${realStudents.length}`);

// Distribution: teams 1-4 get 6 students, teams 5-16 get 5 students
// 4*6 + 12*5 = 24 + 60 = 84
async function updateNames() {
  console.log("🔄 Atualizando nomes dos alunos...\n");

  // First, delete all existing members
  await db.execute(sql`DELETE FROM members`);
  console.log("  ✅ Membros antigos removidos");

  // Get all teams ordered by id
  const [teams] = await db.execute(sql`SELECT id, name FROM teams ORDER BY id`);
  console.log(`  ✅ ${teams.length} equipes encontradas\n`);

  let studentIdx = 0;
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const membersCount = i < 4 ? 6 : 5; // First 4 teams get 6, rest get 5
    
    console.log(`  Equipe ${team.name} (${membersCount} membros):`);
    
    for (let j = 0; j < membersCount && studentIdx < realStudents.length; j++) {
      const name = realStudents[studentIdx];
      await db.execute(
        sql`INSERT INTO members (teamId, name, xp) VALUES (${team.id}, ${name}, '0.0')`
      );
      console.log(`    → ${name}`);
      studentIdx++;
    }
  }

  // Update totalStudents setting
  await db.execute(
    sql`INSERT INTO courseSettings (settingKey, settingValue) VALUES ('totalStudents', '84') ON DUPLICATE KEY UPDATE settingValue = '84'`
  );

  console.log(`\n🎉 ${studentIdx} alunos inseridos com sucesso!`);
  console.log("   Todos os XP foram resetados para 0.0");
  process.exit(0);
}

updateNames().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
