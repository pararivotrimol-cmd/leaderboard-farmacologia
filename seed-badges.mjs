// Seed script to insert all 19 weekly badges into the database
// Run with: node seed-badges.mjs

const BASE_URL = "http://localhost:3000/api/trpc";
const PASSWORD = "farmaco2026";

const badges = [
  {
    name: "Desbravador Farmacológico",
    description: "Completou a Semana 1 — Introdução à Farmacologia e formação de equipes. Primeiro passo na jornada farmacológica!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/PxxmnrVLfupqXVFw.png",
    category: "Semanal",
    week: 1,
    criteria: "Participar da aula inaugural, formar equipe e completar TBL diagnóstico",
  },
  {
    name: "Mestre da Absorção",
    description: "Completou a Semana 2 — Farmacocinética I: Absorção e Distribuição. Dominou vias de administração e biodisponibilidade!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/ehQcJCwQfEfbHmNy.png",
    category: "Semanal",
    week: 2,
    criteria: "Participar da aula de Farmacocinética I e completar TBL 1",
  },
  {
    name: "Alquimista Hepático",
    description: "Completou a Semana 3 — Farmacocinética II: Metabolismo e Excreção. Desvendou o citocromo P450 e a depuração renal!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/qvBYSPrYbReGjijF.png",
    category: "Semanal",
    week: 3,
    criteria: "Participar da aula de Farmacocinética II e completar Caso Clínico 1",
  },
  {
    name: "Decodificador de Receptores",
    description: "Completou a Semana 4 — Farmacodinâmica: Receptores e Mecanismos. Dominou agonistas, antagonistas e dose-resposta!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/sUxfHLiUEEPZcGcI.png",
    category: "Semanal",
    week: 4,
    criteria: "Participar da aula de Farmacodinâmica e completar TBL 2",
  },
  {
    name: "Guardião Colinérgico",
    description: "Completou a Semana 5 — SNA: Transmissão Colinérgica. Dominou agonistas muscarínicos e inibidores da colinesterase!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/SqbdUQqTmGXytbhi.png",
    category: "Semanal",
    week: 5,
    criteria: "Participar da aula de SNA Colinérgico e completar Caso Clínico 2",
  },
  {
    name: "Bloqueador Neuromuscular",
    description: "Completou a Semana 6 — SNA: Bloqueadores Neuromusculares. Dominou despolarizantes e não-despolarizantes!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/aMjsYXYfweRSMSmS.png",
    category: "Semanal",
    week: 6,
    criteria: "Participar da aula de BNM e completar Seminário Jigsaw 1",
  },
  {
    name: "Especialista Jigsaw I",
    description: "Completou a Semana 7 — Seminários Jigsaw 2 e 3. Apresentou com excelência e integrou conhecimentos!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/CMxtAJvDimvbSOHd.png",
    category: "Semanal",
    week: 7,
    criteria: "Participar dos Seminários Jigsaw 2 e 3 e da revisão integrativa",
  },
  {
    name: "Sobrevivente da P1",
    description: "Completou a Semana 8 — Prova P1 + Escape Room Farmacológico. Superou a primeira grande prova e escapou do desafio!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/KQZvuyXfPwEbJDBb.png",
    category: "Semanal",
    week: 8,
    criteria: "Realizar a Prova P1 e participar do Escape Room Farmacológico",
  },
  {
    name: "Mestre Adrenérgico",
    description: "Completou a Semana 9 — SNA: Transmissão Adrenérgica. Dominou agonistas alfa e beta e catecolaminas!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/BOLZDFjkjPaSgcEw.png",
    category: "Semanal",
    week: 9,
    criteria: "Participar da aula de SNA Adrenérgico e completar TBL 3",
  },
  {
    name: "Escudo Anti-adrenérgico",
    description: "Completou a Semana 10 — SNA: Anti-adrenérgicos. Dominou bloqueadores alfa e beta no tratamento da hipertensão!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/SOcpMKzhEiAdbqAc.png",
    category: "Semanal",
    week: 10,
    criteria: "Participar da aula de Anti-adrenérgicos e completar Caso Clínico 3",
  },
  {
    name: "Especialista Jigsaw II",
    description: "Completou a Semana 11 — Seminários Jigsaw 4 e 5. Apresentou sobre SNA adrenérgico com maestria!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/mbowJpeWkSWYmGgs.png",
    category: "Semanal",
    week: 11,
    criteria: "Participar dos Seminários Jigsaw 4 e 5 sobre SNA adrenérgico",
  },
  {
    name: "Domador de COX",
    description: "Completou a Semana 12 — AINEs. Dominou inibidores de COX, seletividade e efeitos adversos!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/PurHygYNIAmKcvAk.png",
    category: "Semanal",
    week: 12,
    criteria: "Participar da aula de AINEs e completar TBL 4",
  },
  {
    name: "Mestre da Analgesia",
    description: "Completou a Semana 13 — Corticosteroides e Opioides. Dominou a escala analgésica e receptores opioides!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/sPhRrgjRcbXIgkVL.png",
    category: "Semanal",
    week: 13,
    criteria: "Participar da aula de Corticosteroides/Opioides e completar Caso Clínico 4",
  },
  {
    name: "Anestesista Local",
    description: "Completou a Semana 14 — Anestésicos Locais. Dominou mecanismos de ação e uso clínico!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/KwXCBsYHMOrrNvUC.png",
    category: "Semanal",
    week: 14,
    criteria: "Participar da aula de Anestésicos Locais e completar Seminário Jigsaw 6",
  },
  {
    name: "Caçador de Histamina",
    description: "Completou a Semana 15 — Anti-histamínicos. Dominou receptores H1/H2 e anti-histamínicos de 1ª e 2ª geração!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/MlVioBReDnLsXhmG.png",
    category: "Semanal",
    week: 15,
    criteria: "Participar da aula de Anti-histamínicos",
  },
  {
    name: "Especialista Jigsaw III",
    description: "Completou a Semana 16 — Seminários Jigsaw 7 e 8 (2º dia). Finalizou todos os seminários com excelência!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/bMcYfwatnBPCRujf.png",
    category: "Semanal",
    week: 16,
    criteria: "Participar dos Seminários Jigsaw 7 e 8 e da revisão integrativa",
  },
  {
    name: "Conquistador da P2",
    description: "Completou a Semana 17 — Prova P2. Superou a segunda grande avaliação do semestre!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/UUiILtIgnPudqKjO.png",
    category: "Semanal",
    week: 17,
    criteria: "Realizar a Prova P2 (conteúdo de adrenérgicos até anti-histamínicos)",
  },
  {
    name: "Guerreiro da Segunda Chamada",
    description: "Completou a Semana 18 — Prova de Segunda Chamada. Aproveitou a segunda chance com determinação!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/gfdwnIBUGtYbXnUE.png",
    category: "Semanal",
    week: 18,
    criteria: "Realizar a prova substitutiva (para quem perdeu P1 ou P2 com justificativa)",
  },
  {
    name: "Campeão Farmacológico",
    description: "Completou a Semana 19 — Prova Final + Premiação. Concluiu toda a jornada de Farmacologia I!",
    iconUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/OJfiqUVhDVWZqbie.png",
    category: "Semanal",
    week: 19,
    criteria: "Completar o semestre inteiro de Farmacologia I e participar da cerimônia de premiação",
  },
];

async function seedBadges() {
  console.log("🏅 Inserindo badges no banco de dados...\n");

  for (const badge of badges) {
    try {
      const response = await fetch(`${BASE_URL}/badges.create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            password: PASSWORD,
            ...badge,
          },
        }),
      });

      const result = await response.json();
      if (result?.result?.data?.json?.id) {
        console.log(`✅ Semana ${badge.week}: "${badge.name}" (ID: ${result.result.data.json.id})`);
      } else {
        console.log(`⚠️  Semana ${badge.week}: "${badge.name}" - Resposta:`, JSON.stringify(result));
      }
    } catch (error) {
      console.error(`❌ Semana ${badge.week}: "${badge.name}" - Erro:`, error.message);
    }
  }

  console.log("\n🎉 Seed de badges concluído!");
}

seedBadges();
