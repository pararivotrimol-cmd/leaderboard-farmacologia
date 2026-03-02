/**
 * Banco completo de questões do jogo Caverna do Dragão — Farmacologia I
 * 17 semanas × 5 questões = 85 missões
 * Dificuldade crescente por semana: Q1=fácil, Q2=fácil, Q3=médio, Q4=difícil, Q5=chefe (boss)
 *
 * Sistema de PF (Pontos Farmacológicos):
 * Semanas 1-4:   Q1-Q4 = 1 PF cada, Q5 (boss) = 1 PF → 5 PF/semana × 4 = 20 PF
 * Semanas 5-10:  Q1-Q4 = 1 PF cada, Q5 (boss) = 2 PF → 6 PF/semana × 6 = 36 PF
 * Semanas 11-17: Q1-Q4 = 1 PF cada, Q5 (boss) = 2 PF → 6 PF/semana × 7 = 42 PF
 * Total: 20 + 36 + 42 = 98 PF ≈ 100 PF (ajustado para exatamente 100)
 *
 * Penalidade por erro no boss: -0.5 PF (descontado do total acumulado)
 */

export interface Alternative {
  id: "a" | "b" | "c" | "d";
  text: string;
  isCorrect: boolean;
}

export interface GameQuestion {
  id: number;           // 1-85
  weekNumber: number;   // 1-17
  questionInWeek: number; // 1-5 (5 = boss)
  title: string;
  npcName: string;
  npcType: "warrior" | "mage" | "healer" | "boss";
  difficulty: "easy" | "medium" | "hard" | "boss";
  isBossQuestion: boolean;
  pfReward: number;     // PF ganhos ao acertar
  pfPenalty: number;    // PF perdidos ao errar (apenas boss questions)
  description: string;
  alternatives: Alternative[];
  explanation: string;
}

// Helper to build a question
function q(
  id: number, week: number, qInWeek: number,
  title: string, npcName: string, npcType: GameQuestion["npcType"],
  difficulty: GameQuestion["difficulty"],
  description: string,
  alternatives: Alternative[],
  explanation: string
): GameQuestion {
  const isBoss = qInWeek === 5;
  // PF reward calculation:
  // Weeks 1-4: non-boss=1, boss=1
  // Weeks 5-10: non-boss=1, boss=2
  // Weeks 11-17: non-boss=1, boss=2
  let pfReward = 1;
  if (isBoss && week >= 5) pfReward = 2;
  // Adjust last few weeks to reach exactly 100 total
  // Weeks 15-16 boss = 3 PF, week 17 boss = 2 PF → total = 100
  if (isBoss && week >= 15 && week <= 16) pfReward = 3;
  // week 17 boss stays at 2 PF (already set above)

  return {
    id, weekNumber: week, questionInWeek: qInWeek,
    title, npcName, npcType, difficulty, isBossQuestion: isBoss,
    pfReward, pfPenalty: isBoss ? 1 : 0,
    description, alternatives, explanation,
  };
}

export const ALL_GAME_QUESTIONS: GameQuestion[] = [

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 1 — Farmacocinética: Absorção e Distribuição
  // ══════════════════════════════════════════════════════════════════
  q(1, 1, 1, "O Portal da Farmacocinética", "Mestre dos Magos", "mage", "easy",
    "Qual é a ordem correta dos processos farmacocinéticos (ADME)?",
    [
      { id: "a", text: "Absorção → Distribuição → Metabolismo → Excreção", isCorrect: true },
      { id: "b", text: "Distribuição → Absorção → Excreção → Metabolismo", isCorrect: false },
      { id: "c", text: "Metabolismo → Absorção → Distribuição → Excreção", isCorrect: false },
      { id: "d", text: "Excreção → Metabolismo → Distribuição → Absorção", isCorrect: false },
    ],
    "A ordem correta é ADME: Absorção, Distribuição, Metabolismo e Excreção."
  ),

  q(2, 1, 2, "O Escudo da Barreira Hematoencefálica", "Sheila", "warrior", "easy",
    "Qual característica um fármaco DEVE ter para atravessar a barreira hematoencefálica (BHE)?",
    [
      { id: "a", text: "Alta polaridade e hidrofilicidade", isCorrect: false },
      { id: "b", text: "Lipofilicidade e baixo peso molecular", isCorrect: true },
      { id: "c", text: "Grande tamanho molecular", isCorrect: false },
      { id: "d", text: "Carga elétrica positiva elevada", isCorrect: false },
    ],
    "Fármacos lipofílicos e de baixo peso molecular atravessam a BHE mais facilmente por difusão passiva."
  ),

  q(3, 1, 3, "A Via de Administração", "Presto", "mage", "medium",
    "Qual via de administração oferece 100% de biodisponibilidade?",
    [
      { id: "a", text: "Via oral", isCorrect: false },
      { id: "b", text: "Via sublingual", isCorrect: false },
      { id: "c", text: "Via intravenosa", isCorrect: true },
      { id: "d", text: "Via intramuscular", isCorrect: false },
    ],
    "A via intravenosa (IV) tem biodisponibilidade de 100% pois o fármaco é administrado diretamente na corrente sanguínea, sem absorção."
  ),

  q(4, 1, 4, "O Volume de Distribuição", "Hank", "warrior", "hard",
    "O volume de distribuição (Vd) de um fármaco é de 500 L em um adulto de 70 kg. Isso indica que o fármaco:",
    [
      { id: "a", text: "Permanece principalmente no plasma", isCorrect: false },
      { id: "b", text: "Distribui-se amplamente nos tecidos", isCorrect: true },
      { id: "c", text: "Não atravessa membranas celulares", isCorrect: false },
      { id: "d", text: "É eliminado rapidamente pelos rins", isCorrect: false },
    ],
    "Um Vd alto (>100 L) indica que o fármaco se distribui amplamente nos tecidos, com baixa concentração plasmática relativa."
  ),

  q(5, 1, 5, "O Guardião do Portal — Sentinela da Farmacocinética", "Guardião do Portal", "boss", "boss",
    "BATALHA DE CHEFE! Um fármaco tem pKa = 7,4 e é uma base fraca. Em qual compartimento ele estará mais ionizado?",
    [
      { id: "a", text: "No plasma (pH 7,4)", isCorrect: false },
      { id: "b", text: "No suco gástrico (pH 1,5–3,5)", isCorrect: true },
      { id: "c", text: "No líquido intersticial (pH 7,0)", isCorrect: false },
      { id: "d", text: "Na urina alcalina (pH 8,0)", isCorrect: false },
    ],
    "Bases fracas se ionizam em meio ácido (pH baixo). No suco gástrico (pH 1,5-3,5), uma base com pKa 7,4 estará quase completamente ionizada, dificultando sua absorção gástrica."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 2 — Farmacocinética: Metabolismo e Excreção
  // ══════════════════════════════════════════════════════════════════
  q(6, 2, 1, "O Forno do Metabolismo", "Bobby", "warrior", "easy",
    "Qual é o principal órgão responsável pelo metabolismo (biotransformação) de fármacos?",
    [
      { id: "a", text: "Rins", isCorrect: false },
      { id: "b", text: "Fígado", isCorrect: true },
      { id: "c", text: "Pulmões", isCorrect: false },
      { id: "d", text: "Intestino delgado", isCorrect: false },
    ],
    "O fígado é o principal órgão de biotransformação, contendo as enzimas do citocromo P450 (CYP) responsáveis pelo metabolismo da maioria dos fármacos."
  ),

  q(7, 2, 2, "A Meia-Vida do Fármaco", "Uni", "healer", "easy",
    "O que é a meia-vida plasmática (t½) de um fármaco?",
    [
      { id: "a", text: "Tempo para o fármaco atingir o pico de concentração", isCorrect: false },
      { id: "b", text: "Tempo para a concentração plasmática reduzir à metade", isCorrect: true },
      { id: "c", text: "Tempo total de ação do fármaco no organismo", isCorrect: false },
      { id: "d", text: "Tempo para o fármaco ser completamente absorvido", isCorrect: false },
    ],
    "A meia-vida (t½) é o tempo necessário para a concentração plasmática do fármaco cair pela metade. Após 4-5 meias-vidas, o fármaco é praticamente eliminado."
  ),

  q(8, 2, 3, "As Reações de Fase I e II", "Eric", "warrior", "medium",
    "Qual das seguintes é uma reação de biotransformação de Fase I?",
    [
      { id: "a", text: "Glicuronidação", isCorrect: false },
      { id: "b", text: "Sulfatação", isCorrect: false },
      { id: "c", text: "Oxidação pelo CYP450", isCorrect: true },
      { id: "d", text: "Acetilação", isCorrect: false },
    ],
    "Reações de Fase I (oxidação, redução, hidrólise) introduzem ou expõem grupos funcionais. Reações de Fase II (conjugação: glicuronidação, sulfatação, acetilação) tornam o fármaco mais hidrofílico para excreção."
  ),

  q(9, 2, 4, "O Efeito de Primeira Passagem", "Mestre dos Magos", "mage", "hard",
    "Um fármaco administrado por via oral tem biodisponibilidade de apenas 20%, embora seja bem absorvido pelo intestino. A causa mais provável é:",
    [
      { id: "a", text: "Baixa solubilidade no suco gástrico", isCorrect: false },
      { id: "b", text: "Intenso efeito de primeira passagem hepática", isCorrect: true },
      { id: "c", text: "Ligação excessiva a proteínas plasmáticas", isCorrect: false },
      { id: "d", text: "Eliminação renal muito rápida", isCorrect: false },
    ],
    "O efeito de primeira passagem ocorre quando o fármaco absorvido pelo intestino passa pelo fígado antes de atingir a circulação sistêmica, sendo extensamente metabolizado. Isso reduz drasticamente a biodisponibilidade oral."
  ),

  q(10, 2, 5, "A Quimera dos Receptores — Besta da Farmacodinâmica", "Quimera dos Receptores", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente com insuficiência renal grave precisa usar um fármaco eliminado 90% pelos rins. Qual ajuste é necessário?",
    [
      { id: "a", text: "Aumentar a dose para compensar a menor eliminação", isCorrect: false },
      { id: "b", text: "Reduzir a dose ou aumentar o intervalo entre doses", isCorrect: true },
      { id: "c", text: "Trocar para via intravenosa", isCorrect: false },
      { id: "d", text: "Nenhum ajuste é necessário", isCorrect: false },
    ],
    "Na insuficiência renal, a eliminação do fármaco é reduzida, levando ao acúmulo. É necessário reduzir a dose ou aumentar o intervalo entre doses para evitar toxicidade."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 3 — Farmacodinâmica: Receptores e Dose-Resposta
  // ══════════════════════════════════════════════════════════════════
  q(11, 3, 1, "O Cajado dos Receptores", "Presto", "mage", "easy",
    "Qual tipo de ligação fármaco-receptor é IRREVERSÍVEL?",
    [
      { id: "a", text: "Ligação iônica", isCorrect: false },
      { id: "b", text: "Ligação de hidrogênio", isCorrect: false },
      { id: "c", text: "Ligação covalente", isCorrect: true },
      { id: "d", text: "Forças de Van der Waals", isCorrect: false },
    ],
    "Ligações covalentes são irreversíveis e as mais fortes entre fármaco-receptor. Exemplo: aspirina inibe irreversivelmente a COX por acetilação covalente."
  ),

  q(12, 3, 2, "A Curva Dose-Resposta", "Hank", "warrior", "easy",
    "O que é a DE50 (Dose Efetiva 50) de um fármaco?",
    [
      { id: "a", text: "Dose letal para 50% da população", isCorrect: false },
      { id: "b", text: "Dose que produz 50% do efeito máximo", isCorrect: true },
      { id: "c", text: "Dose mínima para qualquer efeito", isCorrect: false },
      { id: "d", text: "Dose máxima segura", isCorrect: false },
    ],
    "DE50 é a dose que produz 50% do efeito máximo possível. É usada para comparar a potência entre fármacos: menor DE50 = maior potência."
  ),

  q(13, 3, 3, "Agonistas e Antagonistas", "Bobby", "warrior", "medium",
    "Um fármaco agonista parcial, quando administrado junto com um agonista pleno, pode causar qual efeito?",
    [
      { id: "a", text: "Potencialização do efeito do agonista pleno", isCorrect: false },
      { id: "b", text: "Redução do efeito máximo (antagonismo funcional)", isCorrect: true },
      { id: "c", text: "Nenhuma interação farmacológica", isCorrect: false },
      { id: "d", text: "Duplicação do efeito máximo", isCorrect: false },
    ],
    "O agonista parcial compete com o agonista pleno pelo receptor, mas produz resposta submáxima. Em altas concentrações, o agonista parcial pode reduzir o efeito do agonista pleno."
  ),

  q(14, 3, 4, "O Índice Terapêutico", "Sheila", "warrior", "hard",
    "Um fármaco tem DL50 = 500 mg e DE50 = 50 mg. Qual é seu índice terapêutico (IT) e o que isso significa?",
    [
      { id: "a", text: "IT = 10; margem de segurança relativamente boa", isCorrect: true },
      { id: "b", text: "IT = 0,1; fármaco muito perigoso", isCorrect: false },
      { id: "c", text: "IT = 450; fármaco extremamente seguro", isCorrect: false },
      { id: "d", text: "IT = 1; dose efetiva igual à dose letal", isCorrect: false },
    ],
    "IT = DL50/DE50 = 500/50 = 10. Quanto maior o IT, maior a margem de segurança. Fármacos com IT < 3 (como digoxina, lítio, varfarina) requerem monitoramento sérico."
  ),

  q(15, 3, 5, "A Hidra Autonômica — Serpente do SNA", "Hidra Autonômica", "boss", "boss",
    "BATALHA DE CHEFE! Um antagonista competitivo desloca a curva dose-resposta de um agonista. Qual mudança é esperada?",
    [
      { id: "a", text: "Redução do efeito máximo (Emax) sem alterar a DE50", isCorrect: false },
      { id: "b", text: "Deslocamento para a direita da curva, com Emax preservado", isCorrect: true },
      { id: "c", text: "Deslocamento para a esquerda da curva", isCorrect: false },
      { id: "d", text: "Redução do Emax e aumento da DE50", isCorrect: false },
    ],
    "Antagonistas competitivos deslocam a curva dose-resposta para a direita (aumentam a DE50) mas preservam o Emax, pois podem ser superados por doses maiores do agonista. Antagonistas não-competitivos reduzem o Emax."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 4 — Sistema Nervoso Autônomo: Colinérgicos
  // ══════════════════════════════════════════════════════════════════
  q(16, 4, 1, "O Neurônio Colinérgico", "Uni", "healer", "easy",
    "Qual neurotransmissor é liberado pelos neurônios parassimpáticos pós-ganglionares?",
    [
      { id: "a", text: "Noradrenalina", isCorrect: false },
      { id: "b", text: "Dopamina", isCorrect: false },
      { id: "c", text: "Acetilcolina", isCorrect: true },
      { id: "d", text: "Serotonina", isCorrect: false },
    ],
    "Neurônios parassimpáticos pós-ganglionares liberam acetilcolina (ACh), que age em receptores muscarínicos nos órgãos-alvo."
  ),

  q(17, 4, 2, "Os Receptores Muscarínicos", "Eric", "warrior", "easy",
    "Qual efeito é mediado pelos receptores muscarínicos cardíacos (M2)?",
    [
      { id: "a", text: "Aumento da frequência cardíaca", isCorrect: false },
      { id: "b", text: "Redução da frequência cardíaca (bradicardia)", isCorrect: true },
      { id: "c", text: "Vasoconstrição periférica", isCorrect: false },
      { id: "d", text: "Broncoconstrição", isCorrect: false },
    ],
    "Receptores M2 no coração, quando ativados pela ACh, reduzem a frequência cardíaca (efeito cronotrópico negativo) e a condução AV."
  ),

  q(18, 4, 3, "Os Anticolinesterásicos", "Mestre dos Magos", "mage", "medium",
    "A neostigmina é um anticolinesterásico. Qual é seu mecanismo de ação?",
    [
      { id: "a", text: "Bloqueia receptores muscarínicos", isCorrect: false },
      { id: "b", text: "Inibe a acetilcolinesterase, aumentando ACh na fenda", isCorrect: true },
      { id: "c", text: "Estimula diretamente receptores nicotínicos", isCorrect: false },
      { id: "d", text: "Inibe a síntese de acetilcolina", isCorrect: false },
    ],
    "Anticolinesterásicos inibem a enzima acetilcolinesterase, que degrada a ACh. Isso aumenta a concentração de ACh na fenda sináptica, potencializando seus efeitos."
  ),

  q(19, 4, 4, "A Atropina e seus Efeitos", "Sheila", "warrior", "hard",
    "Um paciente recebeu atropina (antagonista muscarínico). Qual conjunto de efeitos é esperado?",
    [
      { id: "a", text: "Bradicardia, miose, salivação aumentada, broncoespasmo", isCorrect: false },
      { id: "b", text: "Taquicardia, midríase, boca seca, broncodilatação", isCorrect: true },
      { id: "c", text: "Hipotensão, lacrimejamento, diarreia, bradicardia", isCorrect: false },
      { id: "d", text: "Miose, bradicardia, aumento do peristaltismo", isCorrect: false },
    ],
    "A atropina bloqueia receptores muscarínicos, causando o oposto dos efeitos parassimpáticos: taquicardia, midríase, boca seca (inibição das glândulas salivares) e broncodilatação."
  ),

  q(20, 4, 5, "Venger, o Senhor Colinérgico — Mestre dos Receptores Muscarínicos", "Venger", "boss", "boss",
    "BATALHA DE CHEFE! Um organofosforado (inseticida) inibe irreversivelmente a acetilcolinesterase. O antídoto de escolha é:",
    [
      { id: "a", text: "Naloxona", isCorrect: false },
      { id: "b", text: "Flumazenil", isCorrect: false },
      { id: "c", text: "Atropina + pralidoxima (2-PAM)", isCorrect: true },
      { id: "d", text: "N-acetilcisteína", isCorrect: false },
    ],
    "Na intoxicação por organofosforados: atropina bloqueia os efeitos muscarínicos excessivos (bradicardia, secreções, broncoespasmo) e a pralidoxima (2-PAM) reativa a acetilcolinesterase se administrada precocemente."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 5 — Sistema Nervoso Autônomo: Adrenérgicos
  // ══════════════════════════════════════════════════════════════════
  q(21, 5, 1, "Os Receptores Adrenérgicos", "Hank", "warrior", "easy",
    "Qual receptor adrenérgico, quando ativado, causa broncodilatação?",
    [
      { id: "a", text: "α1", isCorrect: false },
      { id: "b", text: "α2", isCorrect: false },
      { id: "c", text: "β1", isCorrect: false },
      { id: "d", text: "β2", isCorrect: true },
    ],
    "Agonistas β2 (como salbutamol) relaxam o músculo liso brônquico, causando broncodilatação. São usados no tratamento da asma."
  ),

  q(22, 5, 2, "A Adrenalina e Noradrenalina", "Bobby", "warrior", "easy",
    "Qual é a diferença principal entre adrenalina e noradrenalina em termos de receptores?",
    [
      { id: "a", text: "Adrenalina age apenas em α; noradrenalina age em α e β", isCorrect: false },
      { id: "b", text: "Adrenalina age em α e β; noradrenalina age principalmente em α", isCorrect: true },
      { id: "c", text: "Ambas agem exclusivamente em receptores β", isCorrect: false },
      { id: "d", text: "Noradrenalina age apenas em β2", isCorrect: false },
    ],
    "Adrenalina age em α1, α2, β1 e β2. Noradrenalina age principalmente em α1 e α2, com fraca ação β2. Por isso, adrenalina causa broncodilatação (β2) enquanto noradrenalina causa vasoconstrição predominante (α1)."
  ),

  q(23, 5, 3, "Os β-Bloqueadores", "Presto", "mage", "medium",
    "O propranolol é um β-bloqueador não-seletivo. Qual efeito adverso é MAIS preocupante em pacientes asmáticos?",
    [
      { id: "a", text: "Taquicardia reflexa", isCorrect: false },
      { id: "b", text: "Broncoespasmo por bloqueio de β2 pulmonares", isCorrect: true },
      { id: "c", text: "Hiperglicemia", isCorrect: false },
      { id: "d", text: "Vasodilatação periférica", isCorrect: false },
    ],
    "Propranolol bloqueia β1 (cardíaco) e β2 (pulmonar). Em asmáticos, o bloqueio de β2 pode precipitar broncoespasmo grave. β-bloqueadores seletivos (metoprolol, atenolol) são preferidos quando necessário."
  ),

  q(24, 5, 4, "Os α-Bloqueadores e Simpatomiméticos", "Eric", "warrior", "hard",
    "A fenilefrina é um agonista α1 seletivo. Qual seria o efeito cardiovascular esperado após sua administração IV?",
    [
      { id: "a", text: "Taquicardia e vasodilatação", isCorrect: false },
      { id: "b", text: "Hipertensão com bradicardia reflexa", isCorrect: true },
      { id: "c", text: "Hipotensão e taquicardia", isCorrect: false },
      { id: "d", text: "Bradicardia sem alteração da pressão", isCorrect: false },
    ],
    "Fenilefrina (α1) causa vasoconstrição → aumento da pressão arterial → bradicardia reflexa mediada pelo barorreflexo (sem efeito β1 direto). É usada para tratar hipotensão e como descongestionante nasal."
  ),

  q(25, 5, 5, "Tiamat, Dragão Adrenérgico — As 5 Cabeças dos Receptores", "Tiamat", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente em choque anafilático recebe adrenalina. Qual mecanismo justifica seu uso?",
    [
      { id: "a", text: "Bloqueia a liberação de histamina pelos mastócitos", isCorrect: false },
      { id: "b", text: "Age em α1 (vasoconstrição), β1 (inotropismo) e β2 (broncodilatação)", isCorrect: true },
      { id: "c", text: "Inibe a síntese de leucotrienos e prostaglandinas", isCorrect: false },
      { id: "d", text: "Antagoniza competitivamente os receptores H1 de histamina", isCorrect: false },
    ],
    "A adrenalina é o tratamento de escolha no choque anafilático por agir em múltiplos receptores: α1 reverte a vasodilatação e hipotensão, β1 aumenta o débito cardíaco, β2 reverte o broncoespasmo."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 6 — Anestésicos Gerais e Locais
  // ══════════════════════════════════════════════════════════════════
  q(26, 6, 1, "Os Anestésicos Inalatórios", "Mestre dos Magos", "mage", "easy",
    "O que é a Concentração Alveolar Mínima (CAM) de um anestésico inalatório?",
    [
      { id: "a", text: "Concentração que causa apneia em 50% dos pacientes", isCorrect: false },
      { id: "b", text: "Concentração que impede movimento em 50% dos pacientes expostos a estímulo cirúrgico", isCorrect: true },
      { id: "c", text: "Concentração máxima segura do anestésico", isCorrect: false },
      { id: "d", text: "Concentração que causa inconsciência em todos os pacientes", isCorrect: false },
    ],
    "CAM é a concentração alveolar mínima de anestésico inalatório que impede movimento em 50% dos pacientes em resposta a estímulo cirúrgico padronizado. Menor CAM = maior potência."
  ),

  q(27, 6, 2, "O Propofol e os Anestésicos IV", "Sheila", "warrior", "easy",
    "O propofol é um anestésico intravenoso muito usado. Qual é sua principal vantagem?",
    [
      { id: "a", text: "Longa duração de ação e analgesia potente", isCorrect: false },
      { id: "b", text: "Recuperação rápida e clara, com baixa incidência de náuseas", isCorrect: true },
      { id: "c", text: "Não causa depressão respiratória", isCorrect: false },
      { id: "d", text: "Pode ser administrado por via oral", isCorrect: false },
    ],
    "Propofol tem recuperação rápida e clara (metabolismo hepático rápido), com baixa incidência de náuseas e vômitos pós-operatórios. Desvantagem: causa depressão respiratória e hipotensão."
  ),

  q(28, 6, 3, "Os Anestésicos Locais", "Bobby", "warrior", "medium",
    "Qual é o mecanismo de ação dos anestésicos locais (ex: lidocaína)?",
    [
      { id: "a", text: "Bloqueiam receptores GABA-A, causando hiperpolarização", isCorrect: false },
      { id: "b", text: "Bloqueiam canais de sódio voltagem-dependentes, impedindo o potencial de ação", isCorrect: true },
      { id: "c", text: "Ativam receptores opioide μ na medula espinal", isCorrect: false },
      { id: "d", text: "Inibem a síntese de prostaglandinas no local da lesão", isCorrect: false },
    ],
    "Anestésicos locais bloqueiam canais de Na+ voltagem-dependentes na forma ionizada (dentro do canal), impedindo a despolarização e a propagação do potencial de ação nervoso."
  ),

  q(29, 6, 4, "A Toxicidade dos Anestésicos", "Hank", "warrior", "hard",
    "A adição de adrenalina a soluções de anestésico local tem qual finalidade principal?",
    [
      { id: "a", text: "Aumentar a velocidade de onset do anestésico", isCorrect: false },
      { id: "b", text: "Causar vasoconstrição local, prolongando a ação e reduzindo toxicidade sistêmica", isCorrect: true },
      { id: "c", text: "Neutralizar o pH ácido da solução anestésica", isCorrect: false },
      { id: "d", text: "Prevenir reações alérgicas ao anestésico", isCorrect: false },
    ],
    "A adrenalina causa vasoconstrição local, reduzindo a absorção sistêmica do anestésico. Isso prolonga a duração da anestesia e reduz o risco de toxicidade sistêmica (convulsões, arritmias)."
  ),

  q(30, 6, 5, "Espectro do Sono — Fantasma dos Anestésicos", "Espectro do Sono", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente apresenta rigidez muscular, hipertermia (>40°C) e instabilidade autonômica após anestesia com halotano. O diagnóstico mais provável é:",
    [
      { id: "a", text: "Reação alérgica ao anestésico", isCorrect: false },
      { id: "b", text: "Hipertermia maligna", isCorrect: true },
      { id: "c", text: "Síndrome neuroléptica maligna", isCorrect: false },
      { id: "d", text: "Sepse pós-operatória", isCorrect: false },
    ],
    "Hipertermia maligna é uma emergência genética (mutação no receptor de rianodina) desencadeada por anestésicos halogenados e succinilcolina. Causa liberação descontrolada de Ca2+ do retículo sarcoplasmático. Tratamento: dantrolene."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 7 — Analgésicos Opioides
  // ══════════════════════════════════════════════════════════════════
  q(31, 7, 1, "Os Receptores Opioides", "Uni", "healer", "easy",
    "Qual receptor opioide é o principal mediador da analgesia e da depressão respiratória?",
    [
      { id: "a", text: "Receptor κ (kappa)", isCorrect: false },
      { id: "b", text: "Receptor μ (mu)", isCorrect: true },
      { id: "c", text: "Receptor δ (delta)", isCorrect: false },
      { id: "d", text: "Receptor σ (sigma)", isCorrect: false },
    ],
    "Receptores μ (mu) medeiam analgesia supraespinal, euforia, dependência, depressão respiratória e constipação. São o principal alvo terapêutico dos opioides."
  ),

  q(32, 7, 2, "A Morfina e seus Efeitos", "Eric", "warrior", "easy",
    "Qual efeito adverso da morfina NÃO desenvolve tolerância com o uso crônico?",
    [
      { id: "a", text: "Analgesia", isCorrect: false },
      { id: "b", text: "Euforia", isCorrect: false },
      { id: "c", text: "Constipação intestinal", isCorrect: true },
      { id: "d", text: "Sedação", isCorrect: false },
    ],
    "A constipação causada por opioides não desenvolve tolerância com o uso crônico, pois os receptores μ intestinais não sofrem dessensibilização. Por isso, laxativos são sempre necessários em pacientes em uso crônico de opioides."
  ),

  q(33, 7, 3, "A Naloxona e o Antagonismo", "Presto", "mage", "medium",
    "A naloxona é usada na overdose de opioides. Por que sua meia-vida curta é clinicamente importante?",
    [
      { id: "a", text: "Porque ela causa dependência se usada por muito tempo", isCorrect: false },
      { id: "b", text: "Porque o paciente pode entrar em depressão respiratória novamente após a naloxona ser eliminada", isCorrect: true },
      { id: "c", text: "Porque ela precisa ser administrada antes do opioide", isCorrect: false },
      { id: "d", text: "Porque ela causa broncoespasmo se usada por muito tempo", isCorrect: false },
    ],
    "A naloxona tem meia-vida de 60-90 min, enquanto muitos opioides têm meia-vida mais longa. Após a naloxona ser eliminada, o opioide ainda presente pode causar nova depressão respiratória (fenômeno de 'renarcotização'). Monitoramento e redoses são necessários."
  ),

  q(34, 7, 4, "Os Opioides e a Escada Analgésica", "Bobby", "warrior", "hard",
    "Segundo a escada analgésica da OMS, qual é a sequência correta de analgésicos?",
    [
      { id: "a", text: "Opioides fortes → opioides fracos → não-opioides", isCorrect: false },
      { id: "b", text: "Não-opioides → opioides fracos → opioides fortes", isCorrect: true },
      { id: "c", text: "Opioides fracos → não-opioides → opioides fortes", isCorrect: false },
      { id: "d", text: "Não-opioides → opioides fortes → adjuvantes", isCorrect: false },
    ],
    "A escada analgésica da OMS tem 3 degraus: 1º) Não-opioides (paracetamol, AINEs) ± adjuvantes; 2º) Opioides fracos (codeína, tramadol) ± não-opioides; 3º) Opioides fortes (morfina, fentanil) ± não-opioides."
  ),

  q(35, 7, 5, "Golem da Dor — Colosso dos Analgésicos", "Golem da Dor", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente oncológico em uso de morfina oral desenvolve tolerância e necessita de doses crescentes. A estratégia mais adequada é:",
    [
      { id: "a", text: "Suspender a morfina imediatamente para evitar dependência", isCorrect: false },
      { id: "b", text: "Aumentar a dose ou fazer rotação de opioides", isCorrect: true },
      { id: "c", text: "Adicionar naloxona para reverter a tolerância", isCorrect: false },
      { id: "d", text: "Trocar para paracetamol para reduzir a tolerância", isCorrect: false },
    ],
    "A tolerância a opioides é esperada no uso crônico. As estratégias incluem: aumento da dose, rotação de opioides (troca por outro opioide com tolerância cruzada incompleta) ou adição de adjuvantes (gabapentina, antidepressivos). Não se deve suspender abruptamente."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 8 — Anti-inflamatórios Não-Esteroidais (AINEs)
  // ══════════════════════════════════════════════════════════════════
  q(36, 8, 1, "A Cascata do Ácido Araquidônico", "Sheila", "warrior", "easy",
    "Qual enzima é inibida pelos AINEs (anti-inflamatórios não-esteroidais)?",
    [
      { id: "a", text: "Lipoxigenase (LOX)", isCorrect: false },
      { id: "b", text: "Fosfolipase A2", isCorrect: false },
      { id: "c", text: "Ciclooxigenase (COX)", isCorrect: true },
      { id: "d", text: "Tromboxano sintase", isCorrect: false },
    ],
    "AINEs inibem as isoformas COX-1 e COX-2 da ciclooxigenase, bloqueando a síntese de prostaglandinas, tromboxanos e prostaciclinas a partir do ácido araquidônico."
  ),

  q(37, 8, 2, "COX-1 vs COX-2", "Mestre dos Magos", "mage", "easy",
    "A COX-1 é constitutiva e a COX-2 é induzível. Qual é a principal consequência clínica da inibição da COX-1?",
    [
      { id: "a", text: "Redução da inflamação", isCorrect: false },
      { id: "b", text: "Lesão da mucosa gástrica e aumento do risco de sangramento", isCorrect: true },
      { id: "c", text: "Redução da febre", isCorrect: false },
      { id: "d", text: "Broncodilatação", isCorrect: false },
    ],
    "COX-1 produz prostaglandinas protetoras da mucosa gástrica e tromboxano A2 (agregação plaquetária). Sua inibição causa lesão gástrica (úlceras) e reduz a agregação plaquetária (risco de sangramento)."
  ),

  q(38, 8, 3, "A Aspirina e seus Usos", "Hank", "warrior", "medium",
    "A aspirina inibe irreversivelmente a COX plaquetária. Por que isso é clinicamente importante na prevenção cardiovascular?",
    [
      { id: "a", text: "Plaquetas não têm núcleo e não podem sintetizar nova COX", isCorrect: true },
      { id: "b", text: "A aspirina tem meia-vida muito longa no plasma", isCorrect: false },
      { id: "c", text: "Plaquetas expressam mais COX-2 que COX-1", isCorrect: false },
      { id: "d", text: "A aspirina também inibe a trombina", isCorrect: false },
    ],
    "Plaquetas são anucleadas e não podem sintetizar nova COX. A inibição irreversível pela aspirina dura toda a vida da plaqueta (~10 dias). Isso reduz a síntese de tromboxano A2 (pró-agregante), justificando o uso em baixas doses para prevenção cardiovascular."
  ),

  q(39, 8, 4, "Os Inibidores Seletivos de COX-2", "Bobby", "warrior", "hard",
    "Os coxibes (celecoxibe, rofecoxibe) foram desenvolvidos para reduzir efeitos gástricos. Por que o rofecoxibe foi retirado do mercado?",
    [
      { id: "a", text: "Causava hepatotoxicidade grave", isCorrect: false },
      { id: "b", text: "Aumento do risco cardiovascular (infarto, AVC) por desequilíbrio prostaciclina/tromboxano", isCorrect: true },
      { id: "c", text: "Causava insuficiência renal aguda em todos os pacientes", isCorrect: false },
      { id: "d", text: "Não era mais eficaz que a aspirina", isCorrect: false },
    ],
    "Ao inibir seletivamente COX-2, os coxibes reduzem a prostaciclina (vasodilatadora, antiagregante) sem reduzir o tromboxano A2 (pró-trombótico, COX-1). Esse desequilíbrio aumenta o risco de eventos cardiovasculares trombóticos."
  ),

  q(40, 8, 5, "Fênix Inflamatória — Ave de Fogo Anti-inflamatória", "Fênix Inflamatória", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente com artrite reumatoide usa ibuprofeno cronicamente e desenvolve insuficiência renal. Qual é o mecanismo?",
    [
      { id: "a", text: "Nefrotoxicidade direta do ibuprofeno nos túbulos renais", isCorrect: false },
      { id: "b", text: "Redução das prostaglandinas renais vasodilatadoras, causando isquemia glomerular", isCorrect: true },
      { id: "c", text: "Precipitação de cristais de ibuprofeno nos túbulos coletores", isCorrect: false },
      { id: "d", text: "Reação alérgica mediada por IgE nos glomérulos", isCorrect: false },
    ],
    "Prostaglandinas renais (PGE2, PGI2) são vasodilatadoras e mantêm o fluxo glomerular, especialmente em situações de baixo débito cardíaco ou hipovolemia. AINEs inibem essas prostaglandinas, causando vasoconstrição aferente e redução da TFG."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 9 — Antimicrobianos: Antibióticos
  // ══════════════════════════════════════════════════════════════════
  q(41, 9, 1, "A Parede Celular Bacteriana", "Eric", "warrior", "easy",
    "Qual antibiótico inibe a síntese da parede celular bacteriana por inibição das transpeptidases (PBPs)?",
    [
      { id: "a", text: "Tetraciclina", isCorrect: false },
      { id: "b", text: "Penicilina", isCorrect: true },
      { id: "c", text: "Eritromicina", isCorrect: false },
      { id: "d", text: "Ciprofloxacino", isCorrect: false },
    ],
    "β-lactâmicos (penicilinas, cefalosporinas, carbapenêmicos) inibem as proteínas ligadoras de penicilina (PBPs/transpeptidases), bloqueando a síntese de peptideoglicano da parede celular bacteriana."
  ),

  q(42, 9, 2, "Os Mecanismos de Ação dos Antibióticos", "Presto", "mage", "easy",
    "As tetraciclinas inibem a síntese proteica bacteriana. Em qual sítio ribossomal atuam?",
    [
      { id: "a", text: "Subunidade 50S — bloqueando a translocação", isCorrect: false },
      { id: "b", text: "Subunidade 30S — bloqueando a ligação do aminoacil-tRNA", isCorrect: true },
      { id: "c", text: "Subunidade 70S — desnaturando o ribossomo", isCorrect: false },
      { id: "d", text: "Subunidade 60S — específica de eucariotos", isCorrect: false },
    ],
    "Tetraciclinas se ligam à subunidade 30S do ribossomo bacteriano, bloqueando a ligação do aminoacil-tRNA ao sítio A, impedindo a síntese proteica. Macrolídeos e cloranfenicol agem na subunidade 50S."
  ),

  q(43, 9, 3, "A Resistência Bacteriana", "Uni", "healer", "medium",
    "Qual é o principal mecanismo de resistência das bactérias aos β-lactâmicos?",
    [
      { id: "a", text: "Mutação nos ribossomos bacterianos", isCorrect: false },
      { id: "b", text: "Produção de β-lactamases que hidrolisam o anel β-lactâmico", isCorrect: true },
      { id: "c", text: "Aumento da síntese de peptideoglicano", isCorrect: false },
      { id: "d", text: "Redução da expressão de receptores muscarínicos", isCorrect: false },
    ],
    "β-lactamases são enzimas que hidrolisam o anel β-lactâmico, inativando o antibiótico. Inibidores de β-lactamase (ácido clavulânico, sulbactam, tazobactam) são combinados com β-lactâmicos para superar essa resistência."
  ),

  q(44, 9, 4, "As Quinolonas e Fluoroquinolonas", "Mestre dos Magos", "mage", "hard",
    "O ciprofloxacino inibe a DNA girase bacteriana. Por que fluoroquinolonas NÃO devem ser usadas em crianças?",
    [
      { id: "a", text: "Causam convulsões em crianças com menos de 12 anos", isCorrect: false },
      { id: "b", text: "Podem causar artropatia (dano à cartilagem de crescimento)", isCorrect: true },
      { id: "c", text: "São ineficazes em infecções pediátricas", isCorrect: false },
      { id: "d", text: "Causam hepatotoxicidade grave em crianças", isCorrect: false },
    ],
    "Fluoroquinolonas podem causar artropatia em animais jovens em crescimento (dano à cartilagem). Por isso, são contraindicadas em crianças e adolescentes, exceto em situações específicas sem alternativa."
  ),

  q(45, 9, 5, "Praga Bacteriana — Enxame dos Antimicrobianos", "Praga Bacteriana", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente com pneumonia por Staphylococcus aureus resistente à meticilina (MRSA) necessita de antibioticoterapia. Qual é o antibiótico de escolha?",
    [
      { id: "a", text: "Amoxicilina + clavulanato", isCorrect: false },
      { id: "b", text: "Vancomicina", isCorrect: true },
      { id: "c", text: "Ciprofloxacino", isCorrect: false },
      { id: "d", text: "Ceftriaxona", isCorrect: false },
    ],
    "MRSA é resistente a todos os β-lactâmicos (incluindo meticilina e oxacilina) por alteração das PBPs. Vancomicina inibe a síntese de peptideoglicano por um mecanismo diferente (ligação ao D-Ala-D-Ala) e é o tratamento padrão para MRSA."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 10 — Fármacos Cardiovasculares I
  // ══════════════════════════════════════════════════════════════════
  q(46, 10, 1, "Os Anti-hipertensivos", "Hank", "warrior", "easy",
    "Qual classe de anti-hipertensivos inibe a enzima conversora de angiotensina (ECA)?",
    [
      { id: "a", text: "Bloqueadores de canais de cálcio", isCorrect: false },
      { id: "b", text: "β-bloqueadores", isCorrect: false },
      { id: "c", text: "Inibidores da ECA (IECAs)", isCorrect: true },
      { id: "d", text: "Diuréticos tiazídicos", isCorrect: false },
    ],
    "IECAs (captopril, enalapril, lisinopril) bloqueiam a conversão de Angiotensina I → Angiotensina II, reduzindo a vasoconstrição e a secreção de aldosterona. Efeito adverso característico: tosse seca (acúmulo de bradicinina)."
  ),

  q(47, 10, 2, "Os Diuréticos", "Sheila", "warrior", "easy",
    "Os diuréticos tiazídicos atuam em qual segmento do néfron?",
    [
      { id: "a", text: "Alça de Henle (ramo ascendente espesso)", isCorrect: false },
      { id: "b", text: "Túbulo contorcido distal", isCorrect: true },
      { id: "c", text: "Túbulo contorcido proximal", isCorrect: false },
      { id: "d", text: "Ducto coletor", isCorrect: false },
    ],
    "Tiazídicos (hidroclorotiazida, clortalidona) inibem o cotransportador Na+/Cl- no túbulo contorcido distal. Diuréticos de alça (furosemida) inibem o cotransportador Na+/K+/2Cl- na alça de Henle."
  ),

  q(48, 10, 3, "A Digoxina e os Glicosídeos Cardíacos", "Bobby", "warrior", "medium",
    "A digoxina inibe a Na+/K+-ATPase cardíaca. Como isso resulta em efeito inotrópico positivo?",
    [
      { id: "a", text: "Aumenta diretamente o Ca2+ intracelular por ativação de canais L", isCorrect: false },
      { id: "b", text: "Inibição da bomba Na+/K+ → acúmulo de Na+ → redução da troca Na+/Ca2+ → aumento de Ca2+ intracelular", isCorrect: true },
      { id: "c", text: "Bloqueia receptores β1, aumentando a contratilidade", isCorrect: false },
      { id: "d", text: "Ativa diretamente a miosina cardíaca", isCorrect: false },
    ],
    "Digoxina inibe Na+/K+-ATPase → acúmulo de Na+ intracelular → redução da atividade do trocador Na+/Ca2+ (que expulsa Ca2+ em troca de Na+) → aumento de Ca2+ intracelular → maior contratilidade (inotropismo positivo)."
  ),

  q(49, 10, 4, "As Estatinas e o Colesterol", "Eric", "warrior", "hard",
    "As estatinas inibem a HMG-CoA redutase. Qual é a consequência do aumento de receptores LDL hepáticos?",
    [
      { id: "a", text: "Aumento do LDL circulante", isCorrect: false },
      { id: "b", text: "Redução do LDL circulante por maior captação hepática", isCorrect: true },
      { id: "c", text: "Aumento do HDL por síntese hepática aumentada", isCorrect: false },
      { id: "d", text: "Redução dos triglicerídeos por inibição da lipase hepática", isCorrect: false },
    ],
    "Estatinas inibem a síntese de colesterol hepático → o fígado compensa aumentando a expressão de receptores LDL → maior captação de LDL circulante → redução do LDL plasmático. Esse é o principal mecanismo de redução do LDL pelas estatinas."
  ),

  q(50, 10, 5, "Tiamat Supremo — O Dragão Final da Farmacologia I", "Tiamat Supremo", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente hipertenso em uso de captopril (IECA) desenvolve tosse seca persistente. A melhor alternativa é:",
    [
      { id: "a", text: "Adicionar um anti-histamínico para controlar a tosse", isCorrect: false },
      { id: "b", text: "Trocar para um bloqueador do receptor de angiotensina II (BRA/sartana)", isCorrect: true },
      { id: "c", text: "Aumentar a dose do captopril para superar a tosse", isCorrect: false },
      { id: "d", text: "Trocar para um β-bloqueador", isCorrect: false },
    ],
    "A tosse dos IECAs é causada pelo acúmulo de bradicinina (que não é degradada quando a ECA é inibida). BRAs (losartana, valsartana) bloqueiam o receptor AT1 da angiotensina II sem afetar a degradação da bradicinina, não causando tosse."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 11 — Fármacos Cardiovasculares II
  // ══════════════════════════════════════════════════════════════════
  q(51, 11, 1, "Os Antiarrítmicos", "Presto", "mage", "easy",
    "Qual classe de antiarrítmicos (classificação de Vaughan Williams) inclui os bloqueadores de canais de sódio?",
    [
      { id: "a", text: "Classe I", isCorrect: true },
      { id: "b", text: "Classe II", isCorrect: false },
      { id: "c", text: "Classe III", isCorrect: false },
      { id: "d", text: "Classe IV", isCorrect: false },
    ],
    "Classe I: bloqueadores de Na+ (lidocaína, quinidina, flecainida). Classe II: β-bloqueadores. Classe III: bloqueadores de K+ (amiodarona, sotalol). Classe IV: bloqueadores de Ca2+ (verapamil, diltiazem)."
  ),

  q(52, 11, 2, "Os Anticoagulantes", "Uni", "healer", "easy",
    "A varfarina é um anticoagulante oral que inibe qual processo?",
    [
      { id: "a", text: "Síntese de fibrinogênio no fígado", isCorrect: false },
      { id: "b", text: "Síntese dos fatores de coagulação dependentes de vitamina K (II, VII, IX, X)", isCorrect: true },
      { id: "c", text: "Agregação plaquetária via inibição da COX", isCorrect: false },
      { id: "d", text: "Ativação da trombina diretamente", isCorrect: false },
    ],
    "Varfarina inibe a vitamina K epóxido redutase, impedindo a regeneração da vitamina K ativa. Sem vitamina K funcional, os fatores II, VII, IX e X não são carboxilados e tornam-se inativos."
  ),

  q(53, 11, 3, "Os Nitratos e Vasodilatadores", "Mestre dos Magos", "mage", "medium",
    "Os nitratos (nitroglicerina, isossorbida) são usados na angina. Qual é seu mecanismo de ação?",
    [
      { id: "a", text: "Bloqueiam canais de Ca2+ nas células musculares lisas vasculares", isCorrect: false },
      { id: "b", text: "Liberam óxido nítrico (NO) → ativação da guanilato ciclase → aumento de GMPc → vasodilatação", isCorrect: true },
      { id: "c", text: "Ativam receptores β2 nas células musculares lisas vasculares", isCorrect: false },
      { id: "d", text: "Inibem a fosfodiesterase, aumentando o AMPc nas células vasculares", isCorrect: false },
    ],
    "Nitratos são pró-fármacos que liberam NO nas células musculares lisas. O NO ativa a guanilato ciclase solúvel → aumento de GMPc → ativação da PKG → desfosforilação da miosina → relaxamento muscular → vasodilatação."
  ),

  q(54, 11, 4, "A Heparina e os Anticoagulantes Parenterais", "Hank", "warrior", "hard",
    "A heparina não fracionada (HNF) potencializa a ação da antitrombina III. Qual é a principal diferença entre HNF e heparina de baixo peso molecular (HBPM)?",
    [
      { id: "a", text: "HBPM inibe apenas o fator Xa; HNF inibe Xa e trombina (IIa)", isCorrect: true },
      { id: "b", text: "HNF é administrada por via oral; HBPM é intravenosa", isCorrect: false },
      { id: "c", text: "HBPM tem meia-vida mais curta e requer monitoramento mais frequente", isCorrect: false },
      { id: "d", text: "HNF não causa trombocitopenia; HBPM causa frequentemente", isCorrect: false },
    ],
    "HNF (cadeia longa) inibe fator Xa e trombina (IIa) via antitrombina III. HBPM (cadeia curta) inibe principalmente fator Xa. HBPM tem maior biodisponibilidade SC, meia-vida mais longa, resposta mais previsível e menor risco de trombocitopenia induzida por heparina (TIH)."
  ),

  q(55, 11, 5, "Kraken Cardiovascular — Monstro das Arritmias", "Kraken Cardiovascular", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente em fibrilação atrial recebe amiodarona. Qual efeito adverso a longo prazo é mais preocupante?",
    [
      { id: "a", text: "Hipoglicemia grave", isCorrect: false },
      { id: "b", text: "Toxicidade pulmonar, tireoidiana, hepática e ocular", isCorrect: true },
      { id: "c", text: "Insuficiência renal aguda", isCorrect: false },
      { id: "d", text: "Agranulocitose", isCorrect: false },
    ],
    "Amiodarona tem múltiplos efeitos adversos por seu acúmulo tecidual (meia-vida de 40-55 dias): pneumonite/fibrose pulmonar, hipo/hipertireoidismo (contém iodo), hepatotoxicidade, microdeposição corneal (halos visuais) e fotossensibilidade."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 12 — Psicofármacos I: Ansiolíticos e Hipnóticos
  // ══════════════════════════════════════════════════════════════════
  q(56, 12, 1, "Os Benzodiazepínicos", "Sheila", "warrior", "easy",
    "Os benzodiazepínicos (diazepam, alprazolam) potencializam qual neurotransmissor inibitório?",
    [
      { id: "a", text: "Glutamato", isCorrect: false },
      { id: "b", text: "GABA (ácido gama-aminobutírico)", isCorrect: true },
      { id: "c", text: "Serotonina", isCorrect: false },
      { id: "d", text: "Dopamina", isCorrect: false },
    ],
    "Benzodiazepínicos se ligam ao receptor GABA-A (sítio benzodiazepínico), aumentando a frequência de abertura dos canais de Cl- em resposta ao GABA. Isso hiperpolariza o neurônio, causando efeitos ansiolítico, sedativo, anticonvulsivante e relaxante muscular."
  ),

  q(57, 12, 2, "Os Barbitúricos", "Eric", "warrior", "easy",
    "Por que os barbitúricos foram amplamente substituídos pelos benzodiazepínicos no tratamento da ansiedade?",
    [
      { id: "a", text: "Barbitúricos são menos eficazes que benzodiazepínicos", isCorrect: false },
      { id: "b", text: "Barbitúricos têm maior risco de depressão respiratória fatal e dependência", isCorrect: true },
      { id: "c", text: "Barbitúricos causam mais náuseas e vômitos", isCorrect: false },
      { id: "d", text: "Barbitúricos são mais caros e difíceis de produzir", isCorrect: false },
    ],
    "Barbitúricos aumentam a DURAÇÃO de abertura dos canais de Cl- do GABA-A (vs. benzodiazepínicos que aumentam a FREQUÊNCIA). Em doses altas, podem abrir os canais independentemente do GABA, causando depressão respiratória fatal. Têm índice terapêutico estreito e alto potencial de dependência."
  ),

  q(58, 12, 3, "O Flumazenil e a Reversão", "Bobby", "warrior", "medium",
    "O flumazenil é o antídoto para overdose de benzodiazepínicos. Qual cuidado é essencial após sua administração?",
    [
      { id: "a", text: "Monitorar a pressão arterial pois causa hipotensão grave", isCorrect: false },
      { id: "b", text: "Monitorar ressedação pois flumazenil tem meia-vida mais curta que os benzodiazepínicos", isCorrect: true },
      { id: "c", text: "Evitar em pacientes com epilepsia pois causa convulsões imediatas", isCorrect: false },
      { id: "d", text: "Administrar apenas por via oral para evitar reações anafiláticas", isCorrect: false },
    ],
    "Flumazenil tem meia-vida de 1-2 horas, enquanto benzodiazepínicos podem ter meia-vida de 20-100 horas. Após a eliminação do flumazenil, o benzodiazepínico ainda presente pode causar ressedação. Monitoramento prolongado é essencial."
  ),

  q(59, 12, 4, "Os Hipnóticos Não-Benzodiazepínicos", "Presto", "mage", "hard",
    "O zolpidem (hipnótico 'Z-drug') age seletivamente em subunidades α1 do receptor GABA-A. Qual é a consequência clínica dessa seletividade?",
    [
      { id: "a", text: "Maior efeito ansiolítico e menor efeito hipnótico", isCorrect: false },
      { id: "b", text: "Efeito hipnótico predominante com menor efeito ansiolítico e anticonvulsivante", isCorrect: true },
      { id: "c", text: "Ausência de tolerância e dependência", isCorrect: false },
      { id: "d", text: "Efeito relaxante muscular mais potente que os benzodiazepínicos", isCorrect: false },
    ],
    "Subunidades α1 do GABA-A medeiam principalmente sedação/hipnose. Subunidades α2/α3 medeiam ansiolise e relaxamento muscular. A seletividade do zolpidem para α1 explica seu perfil predominantemente hipnótico, com menor ansiolise e relaxamento muscular."
  ),

  q(60, 12, 5, "Sombra do Inconsciente — Espírito dos Psicofármacos", "Sombra do Inconsciente", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente com transtorno do pânico usa alprazolam há 2 anos e quer parar. Qual é a abordagem correta?",
    [
      { id: "a", text: "Suspensão abrupta para evitar prolongar a dependência", isCorrect: false },
      { id: "b", text: "Redução gradual da dose (desmame lento) para evitar síndrome de abstinência", isCorrect: true },
      { id: "c", text: "Substituição imediata por barbitúrico de ação longa", isCorrect: false },
      { id: "d", text: "Manutenção da dose indefinidamente pois não há risco de abstinência", isCorrect: false },
    ],
    "A suspensão abrupta de benzodiazepínicos após uso crônico pode causar síndrome de abstinência grave (ansiedade rebote, insônia, tremores, convulsões). O desmame deve ser lento (redução de 10-25% da dose a cada 1-2 semanas), com possível substituição por benzodiazepínico de meia-vida longa."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 13 — Psicofármacos II: Antidepressivos e Antipsicóticos
  // ══════════════════════════════════════════════════════════════════
  q(61, 13, 1, "Os ISRSs", "Mestre dos Magos", "mage", "easy",
    "Os ISRSs (inibidores seletivos da recaptação de serotonina) como a fluoxetina atuam como:",
    [
      { id: "a", text: "Agonistas diretos dos receptores de serotonina", isCorrect: false },
      { id: "b", text: "Inibidores do transportador de recaptação de serotonina (SERT)", isCorrect: true },
      { id: "c", text: "Inibidores da monoamina oxidase (MAO)", isCorrect: false },
      { id: "d", text: "Antagonistas dos receptores 5-HT2A", isCorrect: false },
    ],
    "ISRSs bloqueiam o transportador SERT na membrana pré-sináptica, impedindo a recaptação de serotonina para o neurônio. Isso aumenta a concentração de serotonina na fenda sináptica e potencializa a neurotransmissão serotoninérgica."
  ),

  q(62, 13, 2, "Os Antipsicóticos Típicos", "Hank", "warrior", "easy",
    "Os antipsicóticos típicos (haloperidol, clorpromazina) bloqueiam principalmente qual receptor?",
    [
      { id: "a", text: "Receptores de serotonina 5-HT2A", isCorrect: false },
      { id: "b", text: "Receptores de dopamina D2", isCorrect: true },
      { id: "c", text: "Receptores de glutamato NMDA", isCorrect: false },
      { id: "d", text: "Receptores de histamina H1", isCorrect: false },
    ],
    "Antipsicóticos típicos bloqueiam receptores D2 dopaminérgicos, especialmente na via mesolímbica (efeito antipsicótico). O bloqueio D2 na via nigroestriatal causa efeitos extrapiramidais (parkinsonismo, distonia, acatisia, discinesia tardia)."
  ),

  q(63, 13, 3, "A Síndrome Serotoninérgica", "Sheila", "warrior", "medium",
    "Um paciente em uso de fluoxetina (ISRS) recebe tramadol (opioide com ação serotoninérgica). Qual síndrome pode ocorrer?",
    [
      { id: "a", text: "Síndrome neuroléptica maligna", isCorrect: false },
      { id: "b", text: "Síndrome serotoninérgica", isCorrect: true },
      { id: "c", text: "Síndrome de Stevens-Johnson", isCorrect: false },
      { id: "d", text: "Síndrome de abstinência aguda", isCorrect: false },
    ],
    "A síndrome serotoninérgica ocorre por excesso de serotonina na fenda sináptica. Tríade clínica: alterações cognitivas (agitação, confusão), hiperatividade autonômica (taquicardia, hipertermia, diaforese) e anormalidades neuromusculares (mioclonia, hiperreflexia, tremor)."
  ),

  q(64, 13, 4, "O Lítio e os Estabilizadores de Humor", "Bobby", "warrior", "hard",
    "O lítio é usado no transtorno bipolar. Por que seu índice terapêutico estreito exige monitoramento sérico?",
    [
      { id: "a", text: "Porque o lítio é metabolizado pelo fígado de forma imprevisível", isCorrect: false },
      { id: "b", text: "Porque a diferença entre concentração terapêutica (0,6-1,2 mEq/L) e tóxica (>1,5 mEq/L) é pequena", isCorrect: true },
      { id: "c", text: "Porque o lítio causa dependência física grave", isCorrect: false },
      { id: "d", text: "Porque o lítio tem meia-vida muito curta (< 1 hora)", isCorrect: false },
    ],
    "Lítio tem IT estreito: nível terapêutico 0,6-1,2 mEq/L; sinais de toxicidade acima de 1,5 mEq/L (tremor grosseiro, ataxia, confusão) e toxicidade grave acima de 2,0 mEq/L (convulsões, coma). Desidratação e AINEs aumentam os níveis séricos de lítio."
  ),

  q(65, 13, 5, "Espectro da Mente — Guardião dos Neurotransmissores", "Espectro da Mente", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente em uso de haloperidol desenvolve febre alta, rigidez muscular grave, instabilidade autonômica e elevação de CPK. O diagnóstico é:",
    [
      { id: "a", text: "Síndrome serotoninérgica", isCorrect: false },
      { id: "b", text: "Síndrome neuroléptica maligna (SNM)", isCorrect: true },
      { id: "c", text: "Hipertermia maligna", isCorrect: false },
      { id: "d", text: "Crise colinérgica", isCorrect: false },
    ],
    "SNM é uma emergência rara mas potencialmente fatal causada por antipsicóticos. Tríade: hipertermia, rigidez muscular em 'cano de chumbo' e instabilidade autonômica. Tratamento: suspensão do antipsicótico, dantrolene (relaxante muscular), bromocriptina (agonista dopaminérgico) e suporte intensivo."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 14 — Fármacos do Sistema Endócrino
  // ══════════════════════════════════════════════════════════════════
  q(66, 14, 1, "A Insulina e o Diabetes", "Uni", "healer", "easy",
    "Qual tipo de insulina tem início de ação mais rápido e é usada para controle pós-prandial?",
    [
      { id: "a", text: "Insulina NPH (isófana)", isCorrect: false },
      { id: "b", text: "Insulina glargina", isCorrect: false },
      { id: "c", text: "Insulina regular (humana)", isCorrect: false },
      { id: "d", text: "Análogos ultrarrápidos (lispro, aspart, glulisina)", isCorrect: true },
    ],
    "Análogos ultrarrápidos (lispro, aspart, glulisina) têm início em 5-15 min, pico em 1-2h e duração de 3-5h. São usados imediatamente antes das refeições para controle glicêmico pós-prandial. Insulina regular tem início em 30-60 min."
  ),

  q(67, 14, 2, "Os Hipoglicemiantes Orais", "Eric", "warrior", "easy",
    "A metformina é o hipoglicemiante oral de primeira escolha no DM tipo 2. Qual é seu principal mecanismo?",
    [
      { id: "a", text: "Estimula a secreção de insulina pelas células β pancreáticas", isCorrect: false },
      { id: "b", text: "Reduz a gliconeogênese hepática e melhora a sensibilidade à insulina", isCorrect: true },
      { id: "c", text: "Inibe a absorção intestinal de glicose", isCorrect: false },
      { id: "d", text: "Bloqueia receptores de glucagon no fígado", isCorrect: false },
    ],
    "Metformina ativa a AMPK hepática, reduzindo a gliconeogênese (principal mecanismo). Também melhora a sensibilidade à insulina nos tecidos periféricos. Não causa hipoglicemia isolada e pode causar acidose lática (rara, principalmente em insuficiência renal)."
  ),

  q(68, 14, 3, "Os Corticosteroides", "Presto", "mage", "medium",
    "O uso crônico de corticosteroides sistêmicos (prednisona, dexametasona) pode causar qual síndrome?",
    [
      { id: "a", text: "Síndrome de Addison (insuficiência adrenal)", isCorrect: false },
      { id: "b", text: "Síndrome de Cushing iatrogênica", isCorrect: true },
      { id: "c", text: "Síndrome de Conn (hiperaldosteronismo primário)", isCorrect: false },
      { id: "d", text: "Síndrome de Waterhouse-Friderichsen", isCorrect: false },
    ],
    "O uso crônico de corticosteroides exógenos causa síndrome de Cushing iatrogênica: obesidade central, face de lua cheia, estrias, hipertensão, diabetes, osteoporose, imunossupressão e supressão do eixo HPA."
  ),

  q(69, 14, 4, "Os Hormônios Tireoidianos", "Mestre dos Magos", "mage", "hard",
    "O propiltiouracil (PTU) é usado no hipertireoidismo. Além de inibir a síntese de hormônios tireoidianos, qual outra ação o torna preferível ao metimazol na crise tireotóxica?",
    [
      { id: "a", text: "PTU tem início de ação mais rápido na inibição da síntese", isCorrect: false },
      { id: "b", text: "PTU inibe a conversão periférica de T4 em T3 (mais ativo)", isCorrect: true },
      { id: "c", text: "PTU tem menor risco de agranulocitose", isCorrect: false },
      { id: "d", text: "PTU pode ser administrado por via intravenosa", isCorrect: false },
    ],
    "PTU inibe tanto a síntese de hormônios tireoidianos (inibição da peroxidase tireoidiana) quanto a conversão periférica de T4 em T3 pela 5'-deiodinase. Na crise tireotóxica, essa ação dupla é vantajosa. Metimazol é preferido no tratamento crônico por ter menos efeitos adversos."
  ),

  q(70, 14, 5, "Colosso Endócrino — Titã dos Hormônios", "Colosso Endócrino", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente diabético tipo 1 em uso de insulina glargina desenvolve hipoglicemia grave. O tratamento de emergência é:",
    [
      { id: "a", text: "Insulina regular IV para estabilizar a glicemia", isCorrect: false },
      { id: "b", text: "Glucagon IM/SC ou glicose IV se acesso venoso disponível", isCorrect: true },
      { id: "c", text: "Metformina oral para reduzir a gliconeogênese", isCorrect: false },
      { id: "d", text: "Corticosteroide IV para aumentar a glicemia", isCorrect: false },
    ],
    "Na hipoglicemia grave (paciente inconsciente ou sem acesso oral): glucagon 1mg IM/SC (estimula glicogenólise hepática) ou glicose 50% IV (10-25g). Glucagon é o tratamento de emergência pré-hospitalar. Corticosteroides aumentam a glicemia mas são de segunda linha e de ação lenta."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 15 — Quimioterápicos Antineoplásicos
  // ══════════════════════════════════════════════════════════════════
  q(71, 15, 1, "Os Mecanismos dos Quimioterápicos", "Sheila", "warrior", "easy",
    "Qual é o mecanismo de ação dos agentes alquilantes (ex: ciclofosfamida)?",
    [
      { id: "a", text: "Inibem a topoisomerase II, causando quebras no DNA", isCorrect: false },
      { id: "b", text: "Formam ligações covalentes com o DNA, impedindo sua replicação", isCorrect: true },
      { id: "c", text: "Inibem a síntese de purinas e pirimidinas", isCorrect: false },
      { id: "d", text: "Estabilizam os microtúbulos, impedindo a mitose", isCorrect: false },
    ],
    "Agentes alquilantes (ciclofosfamida, cisplatina, carmustina) formam ligações covalentes (alquilação) com o DNA, principalmente entre bases de guanina, causando pontes cruzadas que impedem a replicação e transcrição do DNA."
  ),

  q(72, 15, 2, "Os Antimetabólitos", "Bobby", "warrior", "easy",
    "O metotrexato é um antimetabólito que inibe qual enzima?",
    [
      { id: "a", text: "Timidilato sintase", isCorrect: false },
      { id: "b", text: "Di-hidrofolato redutase (DHFR)", isCorrect: true },
      { id: "c", text: "Ribonucleotídeo redutase", isCorrect: false },
      { id: "d", text: "DNA polimerase α", isCorrect: false },
    ],
    "Metotrexato inibe a DHFR, impedindo a conversão de di-hidrofolato em tetra-hidrofolato (THF). Sem THF, a síntese de timidilato e purinas é comprometida, bloqueando a síntese de DNA. O leucovorin (ácido folínico) é usado como 'resgate' para reduzir toxicidade."
  ),

  q(73, 15, 3, "Os Taxanos e Alcaloides da Vinca", "Hank", "warrior", "medium",
    "Paclitaxel (taxano) e vincristina (alcaloide da vinca) afetam os microtúbulos. Qual é a diferença entre seus mecanismos?",
    [
      { id: "a", text: "Paclitaxel polimeriza microtúbulos (estabiliza); vincristina despolimeriza (inibe formação)", isCorrect: true },
      { id: "b", text: "Ambos inibem a polimerização dos microtúbulos", isCorrect: false },
      { id: "c", text: "Paclitaxel age na fase S; vincristina age na fase G1", isCorrect: false },
      { id: "d", text: "Vincristina estabiliza microtúbulos; paclitaxel os despolimeriza", isCorrect: false },
    ],
    "Paclitaxel (e docetaxel) estabilizam os microtúbulos, impedindo sua despolimerização → células ficam presas na mitose. Alcaloides da vinca (vincristina, vinblastina) inibem a polimerização dos microtúbulos → fuso mitótico não se forma → bloqueio na metáfase."
  ),

  q(74, 15, 4, "Os Inibidores de Tirosina Quinase", "Eric", "warrior", "hard",
    "O imatinibe (Gleevec) revolucionou o tratamento da leucemia mieloide crônica (LMC). Qual é seu alvo molecular?",
    [
      { id: "a", text: "Receptor de EGFR (fator de crescimento epidérmico)", isCorrect: false },
      { id: "b", text: "BCR-ABL tirosina quinase (produto do cromossomo Philadelphia)", isCorrect: true },
      { id: "c", text: "VEGFR (receptor do fator de crescimento vascular)", isCorrect: false },
      { id: "d", text: "mTOR (alvo da rapamicina em mamíferos)", isCorrect: false },
    ],
    "O cromossomo Philadelphia (t(9;22)) gera a proteína de fusão BCR-ABL, uma tirosina quinase constitutivamente ativa que promove proliferação celular descontrolada na LMC. Imatinibe inibe seletivamente a BCR-ABL, transformando a LMC de doença fatal em condição controlável."
  ),

  q(75, 15, 5, "Hidra do Câncer — Serpente Oncológica", "Hidra do Câncer", "boss", "boss",
    "BATALHA DE CHEFE! Um paciente em quimioterapia com cisplatina desenvolve nefrotoxicidade. Qual medida preventiva é mais importante?",
    [
      { id: "a", text: "Administrar N-acetilcisteína antes da cisplatina", isCorrect: false },
      { id: "b", text: "Hiperidratação com solução salina e diurese forçada", isCorrect: true },
      { id: "c", text: "Reduzir a dose de cisplatina pela metade", isCorrect: false },
      { id: "d", text: "Administrar furosemida para aumentar a diurese antes da cisplatina", isCorrect: false },
    ],
    "A nefrotoxicidade da cisplatina é dose-dependente e ocorre por acúmulo nos túbulos proximais. A hiperidratação (2-3L de SF antes e após) com diurese forçada reduz a concentração de cisplatina no filtrado tubular, minimizando o dano renal. Amifostina também é usada como nefroprotetor."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 16 — Farmacologia Especial: Gestação, Pediatria e Idosos
  // ══════════════════════════════════════════════════════════════════
  q(76, 16, 1, "Os Fármacos na Gestação", "Uni", "healer", "easy",
    "Qual categoria da FDA indica que estudos em animais mostraram risco fetal e não há estudos adequados em humanos?",
    [
      { id: "a", text: "Categoria A", isCorrect: false },
      { id: "b", text: "Categoria B", isCorrect: false },
      { id: "c", text: "Categoria C", isCorrect: true },
      { id: "d", text: "Categoria D", isCorrect: false },
    ],
    "Categoria A: estudos em humanos sem risco. Categoria B: estudos em animais sem risco, sem estudos em humanos. Categoria C: estudos em animais com risco, sem estudos em humanos. Categoria D: evidência de risco em humanos, mas benefícios podem superar riscos. Categoria X: contraindicado."
  ),

  q(77, 16, 2, "A Farmacocinética Pediátrica", "Presto", "mage", "easy",
    "Por que recém-nascidos têm maior sensibilidade a fármacos que afetam o SNC em comparação a adultos?",
    [
      { id: "a", text: "Maior atividade das enzimas CYP450 neonatais", isCorrect: false },
      { id: "b", text: "Barreira hematoencefálica imatura e maior permeabilidade", isCorrect: true },
      { id: "c", text: "Maior ligação a proteínas plasmáticas em recém-nascidos", isCorrect: false },
      { id: "d", text: "Maior volume de distribuição para fármacos lipofílicos", isCorrect: false },
    ],
    "A BHE em recém-nascidos é imatura (menor expressão de proteínas de junção estreita e transportadores de efluxo), permitindo maior penetração de fármacos no SNC. Além disso, recém-nascidos têm menor albumina sérica (menor ligação proteica) e menor atividade do CYP450."
  ),

  q(78, 16, 3, "A Farmacologia no Idoso", "Mestre dos Magos", "mage", "medium",
    "Um idoso de 80 anos usa múltiplos medicamentos (polifarmácia). Qual alteração farmacocinética é mais relevante nessa faixa etária?",
    [
      { id: "a", text: "Aumento da absorção gastrointestinal de todos os fármacos", isCorrect: false },
      { id: "b", text: "Redução da função renal (TFG) e hepática, com risco de acúmulo", isCorrect: true },
      { id: "c", text: "Aumento da atividade do CYP450 hepático", isCorrect: false },
      { id: "d", text: "Redução do volume de distribuição para fármacos lipofílicos", isCorrect: false },
    ],
    "No idoso: TFG reduz ~1% ao ano após os 40 anos (risco de acúmulo de fármacos eliminados pelos rins); fluxo hepático reduzido (menor metabolismo de primeira passagem); albumina reduzida (maior fração livre de fármacos); maior gordura corporal (maior Vd para lipofílicos); menor água corporal."
  ),

  q(79, 16, 4, "A Teratogenicidade", "Hank", "warrior", "hard",
    "A talidomida causou focomelia em milhares de crianças nos anos 1960. Qual foi a principal lição farmacológica aprendida?",
    [
      { id: "a", text: "Fármacos com alta lipofilicidade não devem ser usados na gestação", isCorrect: false },
      { id: "b", text: "A placenta não é uma barreira eficaz e fármacos podem causar teratogenicidade", isCorrect: true },
      { id: "c", text: "Apenas fármacos de síntese química são teratogênicos", isCorrect: false },
      { id: "d", text: "Testes em animais são suficientes para prever teratogenicidade humana", isCorrect: false },
    ],
    "A tragédia da talidomida demonstrou que a placenta não protege o feto e que fármacos podem ser teratogênicos em humanos mesmo sem toxicidade em animais (talidomida não era teratogênica em ratos). Isso levou à criação de sistemas de classificação de risco na gestação e testes de teratogenicidade obrigatórios."
  ),

  q(80, 16, 5, "Oráculo do Tempo — Guardião das Gerações", "Oráculo do Tempo", "boss", "boss",
    "BATALHA DE CHEFE! Uma gestante no 1º trimestre com epilepsia precisa de anticonvulsivante. Qual fármaco tem MAIOR risco teratogênico e deve ser evitado?",
    [
      { id: "a", text: "Lamotrigina", isCorrect: false },
      { id: "b", text: "Valproato de sódio", isCorrect: true },
      { id: "c", text: "Levetiracetam", isCorrect: false },
      { id: "d", text: "Carbamazepina", isCorrect: false },
    ],
    "Valproato tem o maior risco teratogênico entre os anticonvulsivantes: espinha bífida (1-2%), malformações cardíacas, fissura palatina e déficits cognitivos no filho (síndrome fetal do valproato). Lamotrigina e levetiracetam têm perfis de segurança mais favoráveis na gestação, embora nenhum anticonvulsivante seja completamente seguro."
  ),

  // ══════════════════════════════════════════════════════════════════
  // SEMANA 17 — Revisão Integrativa e Casos Clínicos
  // ══════════════════════════════════════════════════════════════════
  q(81, 17, 1, "O Caso Clínico Integrado I", "Dungeon Master", "mage", "easy",
    "Um paciente com HAS, DM2 e insuficiência cardíaca. Qual combinação farmacológica é mais adequada?",
    [
      { id: "a", text: "β-bloqueador + diurético tiazídico + IECA", isCorrect: true },
      { id: "b", text: "α-bloqueador + bloqueador de canal de Ca2+ + estatina", isCorrect: false },
      { id: "c", text: "IECA + ARAII (sartana) combinados + diurético de alça", isCorrect: false },
      { id: "d", text: "Digoxina + espironolactona + nitrato", isCorrect: false },
    ],
    "Na insuficiência cardíaca com HAS e DM2: IECAs (reduzem pós-carga e são nefroprotetores no DM), β-bloqueadores (reduzem mortalidade na IC) e diuréticos tiazídicos (controle da PA). IECA + ARAII combinados aumentam risco de hipercalemia e são contraindicados."
  ),

  q(82, 17, 2, "O Caso Clínico Integrado II", "Todos os Heróis", "warrior", "easy",
    "Um paciente com infecção urinária por E. coli sensível. Qual antibiótico de primeira escolha para tratamento ambulatorial?",
    [
      { id: "a", text: "Vancomicina oral", isCorrect: false },
      { id: "b", text: "Nitrofurantoína ou trimetoprim-sulfametoxazol", isCorrect: true },
      { id: "c", text: "Meropeném IV", isCorrect: false },
      { id: "d", text: "Linezolida oral", isCorrect: false },
    ],
    "Para ITU não complicada por E. coli sensível: nitrofurantoína (5-7 dias) ou trimetoprim-sulfametoxazol (3 dias) são de primeira escolha. Fluoroquinolonas são reservadas para casos mais graves ou resistência. Vancomicina e meropeném são para infecções graves hospitalares."
  ),

  q(83, 17, 3, "As Interações Farmacológicas", "Venger", "boss", "medium",
    "Um paciente em uso de varfarina inicia tratamento com rifampicina (tuberculose). O que é esperado?",
    [
      { id: "a", text: "Aumento do efeito anticoagulante da varfarina (risco de sangramento)", isCorrect: false },
      { id: "b", text: "Redução do efeito anticoagulante da varfarina (risco de trombose)", isCorrect: true },
      { id: "c", text: "Nenhuma interação clinicamente relevante", isCorrect: false },
      { id: "d", text: "Toxicidade hepática grave pela combinação", isCorrect: false },
    ],
    "Rifampicina é um potente indutor das enzimas CYP450 (especialmente CYP2C9, que metaboliza a varfarina). A indução aumenta o metabolismo da varfarina, reduzindo seus níveis plasmáticos e efeito anticoagulante. A dose de varfarina precisa ser aumentada e o INR monitorado frequentemente."
  ),

  q(84, 17, 4, "A Farmacogenômica", "Tiamat", "boss", "hard",
    "Um paciente metabolizador ultrarrápido do CYP2D6 usa codeína para analgesia. Qual é o risco específico?",
    [
      { id: "a", text: "Ausência de efeito analgésico por metabolismo insuficiente", isCorrect: false },
      { id: "b", text: "Conversão excessiva de codeína em morfina, com risco de depressão respiratória", isCorrect: true },
      { id: "c", text: "Acúmulo de codeína não metabolizada causando hepatotoxicidade", isCorrect: false },
      { id: "d", text: "Reação alérgica cruzada com outros opioides", isCorrect: false },
    ],
    "CYP2D6 converte codeína (pró-fármaco) em morfina (ativa). Metabolizadores ultrarrápidos (~1-2% da população) convertem codeína em morfina muito rapidamente, podendo atingir concentrações tóxicas de morfina com doses normais de codeína. Isso é especialmente perigoso em crianças e durante a amamentação."
  ),

  q(85, 17, 5, "Tiamat Supremo — Dragão Final da Farmacologia I", "Tiamat Supremo", "boss", "boss",
    "BATALHA FINAL! Um paciente de 65 anos, hipertenso, diabético, com fibrilação atrial e insuficiência renal moderada (TFG 35 mL/min). Qual anticoagulante oral é CONTRAINDICADO?",
    [
      { id: "a", text: "Varfarina", isCorrect: false },
      { id: "b", text: "Apixabana", isCorrect: false },
      { id: "c", text: "Dabigatrana", isCorrect: true },
      { id: "d", text: "Rivaroxabana em dose reduzida", isCorrect: false },
    ],
    "Dabigatrana é eliminada 80% pelos rins. Com TFG < 30 mL/min é contraindicada; com TFG 30-50 mL/min requer cautela extrema. Apixabana tem menor dependência renal (~27% renal) e pode ser usada com ajuste de dose. Varfarina não é eliminada pelos rins (metabolismo hepático) e é uma opção, mas requer monitoramento do INR."
  ),
];

// Helper to get questions by week
export function getQuestionsByWeek(weekNumber: number): GameQuestion[] {
  return ALL_GAME_QUESTIONS.filter(q => q.weekNumber === weekNumber);
}

// Helper to get a specific question
export function getQuestionById(id: number): GameQuestion | undefined {
  return ALL_GAME_QUESTIONS.find(q => q.id === id);
}

// Helper to get boss question for a week
export function getBossQuestion(weekNumber: number): GameQuestion | undefined {
  return ALL_GAME_QUESTIONS.find(q => q.weekNumber === weekNumber && q.isBossQuestion);
}

// Calculate total PF available
export const TOTAL_PF_AVAILABLE = ALL_GAME_QUESTIONS.reduce((sum, q) => sum + q.pfReward, 0);
