/**
 * Extra questions for each quest (3-4 per quest)
 * Each quest can randomly pick from these + the original question
 * Format matches the BUILTIN_QUESTS alternatives structure
 */
export interface ExtraQuestion {
  description: string; // The question text
  alternatives: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

// Map of questId -> array of extra questions
export const QUEST_EXTRA_QUESTIONS: Record<number, ExtraQuestion[]> = {
  // ─── Quest 1: O Portal da Farmacocinética (Semana 1) ───
  1: [
    {
      description: "Qual via de administração oferece 100% de biodisponibilidade?",
      alternatives: [
        { id: "a", text: "Via oral", isCorrect: false },
        { id: "b", text: "Via intravenosa", isCorrect: true },
        { id: "c", text: "Via sublingual", isCorrect: false },
        { id: "d", text: "Via intramuscular", isCorrect: false },
      ],
      explanation: "A via intravenosa (IV) tem biodisponibilidade de 100% pois o fármaco é administrado diretamente na corrente sanguínea.",
    },
    {
      description: "O que é meia-vida plasmática (t½) de um fármaco?",
      alternatives: [
        { id: "a", text: "Tempo para o fármaco atingir o pico de concentração", isCorrect: false },
        { id: "b", text: "Tempo para a concentração plasmática reduzir pela metade", isCorrect: true },
        { id: "c", text: "Tempo total de ação do fármaco no organismo", isCorrect: false },
        { id: "d", text: "Tempo para o fármaco ser completamente absorvido", isCorrect: false },
      ],
      explanation: "A meia-vida (t½) é o tempo necessário para a concentração plasmática do fármaco cair pela metade.",
    },
    {
      description: "Qual fator NÃO influencia a absorção de fármacos por via oral?",
      alternatives: [
        { id: "a", text: "pH gástrico", isCorrect: false },
        { id: "b", text: "Motilidade gastrointestinal", isCorrect: false },
        { id: "c", text: "Cor do comprimido", isCorrect: true },
        { id: "d", text: "Presença de alimentos", isCorrect: false },
      ],
      explanation: "A cor do comprimido é apenas estética e não influencia a absorção. pH, motilidade e alimentos são fatores reais.",
    },
  ],

  // ─── Quest 2: O Escudo de Sheila e a BHE (Semana 1) ───
  2: [
    {
      description: "Qual proteína plasmática é a principal responsável pela ligação de fármacos ácidos?",
      alternatives: [
        { id: "a", text: "Albumina", isCorrect: true },
        { id: "b", text: "Globulina", isCorrect: false },
        { id: "c", text: "Fibrinogênio", isCorrect: false },
        { id: "d", text: "Transferrina", isCorrect: false },
      ],
      explanation: "A albumina é a principal proteína de ligação para fármacos ácidos no plasma.",
    },
    {
      description: "O que acontece quando dois fármacos competem pela mesma proteína plasmática?",
      alternatives: [
        { id: "a", text: "Ambos são inativados", isCorrect: false },
        { id: "b", text: "O fármaco deslocado tem seu efeito aumentado", isCorrect: true },
        { id: "c", text: "Ambos são eliminados mais rapidamente", isCorrect: false },
        { id: "d", text: "Não há consequência clínica", isCorrect: false },
      ],
      explanation: "Quando um fármaco é deslocado da proteína, sua fração livre aumenta, intensificando o efeito farmacológico.",
    },
    {
      description: "Qual compartimento corporal tem maior volume de distribuição para fármacos lipofílicos?",
      alternatives: [
        { id: "a", text: "Plasma sanguíneo", isCorrect: false },
        { id: "b", text: "Líquido extracelular", isCorrect: false },
        { id: "c", text: "Tecido adiposo", isCorrect: true },
        { id: "d", text: "Líquido cefalorraquidiano", isCorrect: false },
      ],
      explanation: "Fármacos lipofílicos se acumulam no tecido adiposo, resultando em grande volume de distribuição.",
    },
  ],

  // ─── Quest 3: O Cajado de Presto e os Receptores (Semana 2) ───
  3: [
    {
      description: "Qual tipo de receptor possui atividade enzimática intrínseca?",
      alternatives: [
        { id: "a", text: "Receptor ionotrópico", isCorrect: false },
        { id: "b", text: "Receptor acoplado à proteína G", isCorrect: false },
        { id: "c", text: "Receptor tirosina-quinase", isCorrect: true },
        { id: "d", text: "Receptor nuclear", isCorrect: false },
      ],
      explanation: "Receptores tirosina-quinase (ex: receptor de insulina) possuem atividade enzimática intrínseca.",
    },
    {
      description: "O que é dessensibilização de receptores?",
      alternatives: [
        { id: "a", text: "Aumento da resposta após exposição repetida", isCorrect: false },
        { id: "b", text: "Diminuição da resposta após exposição prolongada ao agonista", isCorrect: true },
        { id: "c", text: "Bloqueio irreversível do receptor", isCorrect: false },
        { id: "d", text: "Aumento do número de receptores", isCorrect: false },
      ],
      explanation: "Dessensibilização (taquifilaxia) é a redução progressiva da resposta após exposição contínua ao agonista.",
    },
    {
      description: "Receptores acoplados à proteína G (GPCRs) possuem quantos domínios transmembrana?",
      alternatives: [
        { id: "a", text: "3 domínios", isCorrect: false },
        { id: "b", text: "5 domínios", isCorrect: false },
        { id: "c", text: "7 domínios", isCorrect: true },
        { id: "d", text: "12 domínios", isCorrect: false },
      ],
      explanation: "GPCRs são receptores com 7 domínios transmembrana (receptores serpentinos).",
    },
  ],

  // ─── Quest 4: O Arco de Hank e a Dose-Resposta (Semana 2) ───
  4: [
    {
      description: "O que representa a EC50 em uma curva dose-resposta?",
      alternatives: [
        { id: "a", text: "Dose que causa efeito em 50% dos pacientes", isCorrect: false },
        { id: "b", text: "Concentração que produz 50% do efeito máximo", isCorrect: true },
        { id: "c", text: "Dose letal para 50% da população", isCorrect: false },
        { id: "d", text: "Concentração mínima eficaz", isCorrect: false },
      ],
      explanation: "EC50 é a concentração efetiva que produz 50% da resposta máxima (Emax).",
    },
    {
      description: "Qual é o índice terapêutico de um fármaco?",
      alternatives: [
        { id: "a", text: "Relação entre dose eficaz e dose máxima", isCorrect: false },
        { id: "b", text: "Relação DL50/DE50", isCorrect: true },
        { id: "c", text: "Relação entre potência e eficácia", isCorrect: false },
        { id: "d", text: "Relação entre absorção e eliminação", isCorrect: false },
      ],
      explanation: "O índice terapêutico (IT = DL50/DE50) indica a margem de segurança do fármaco.",
    },
    {
      description: "Um fármaco com alta POTÊNCIA necessariamente tem alta EFICÁCIA?",
      alternatives: [
        { id: "a", text: "Sim, potência e eficácia são sinônimos", isCorrect: false },
        { id: "b", text: "Não, são conceitos independentes", isCorrect: true },
        { id: "c", text: "Sim, pois ambos dependem da afinidade", isCorrect: false },
        { id: "d", text: "Depende da via de administração", isCorrect: false },
      ],
      explanation: "Potência (dose necessária) e eficácia (efeito máximo) são conceitos independentes.",
    },
  ],

  // ─── Quest 5: O Bastão de Bobby e os Agonistas (Semana 3) ───
  5: [
    {
      description: "Qual é a diferença entre agonista total e agonista parcial?",
      alternatives: [
        { id: "a", text: "Agonista total age mais rápido", isCorrect: false },
        { id: "b", text: "Agonista parcial produz resposta máxima menor", isCorrect: true },
        { id: "c", text: "Agonista total tem mais efeitos colaterais", isCorrect: false },
        { id: "d", text: "Agonista parcial não se liga ao receptor", isCorrect: false },
      ],
      explanation: "Agonista parcial tem atividade intrínseca menor que 1, produzindo resposta submáxima mesmo em ocupação total.",
    },
    {
      description: "O que é um agonista inverso?",
      alternatives: [
        { id: "a", text: "Um fármaco que bloqueia o receptor", isCorrect: false },
        { id: "b", text: "Um fármaco que produz efeito oposto ao agonista", isCorrect: true },
        { id: "c", text: "Um antagonista competitivo", isCorrect: false },
        { id: "d", text: "Um fármaco que age em receptor diferente", isCorrect: false },
      ],
      explanation: "Agonista inverso reduz a atividade constitutiva do receptor, produzindo efeito oposto ao agonista.",
    },
    {
      description: "A acetilcolina é agonista de quais tipos de receptores?",
      alternatives: [
        { id: "a", text: "Apenas nicotínicos", isCorrect: false },
        { id: "b", text: "Apenas muscarínicos", isCorrect: false },
        { id: "c", text: "Nicotínicos e muscarínicos", isCorrect: true },
        { id: "d", text: "Adrenérgicos e colinérgicos", isCorrect: false },
      ],
      explanation: "A acetilcolina é agonista endógeno tanto de receptores nicotínicos quanto muscarínicos.",
    },
  ],

  // ─── Quest 6: A Floresta dos Antagonistas (Semana 3) ───
  6: [
    {
      description: "Qual é a característica de um antagonista NÃO-COMPETITIVO?",
      alternatives: [
        { id: "a", text: "Pode ser superado aumentando a dose do agonista", isCorrect: false },
        { id: "b", text: "Liga-se a um sítio diferente do agonista e reduz o Emax", isCorrect: true },
        { id: "c", text: "Tem afinidade pelo receptor mas sem atividade intrínseca", isCorrect: false },
        { id: "d", text: "Bloqueia reversivelmente o sítio ativo", isCorrect: false },
      ],
      explanation: "Antagonista não-competitivo liga-se a sítio alostérico, reduzindo o efeito máximo (Emax) sem afetar a EC50.",
    },
    {
      description: "O que acontece com a curva dose-resposta na presença de um antagonista competitivo?",
      alternatives: [
        { id: "a", text: "Desloca para a direita sem alterar o Emax", isCorrect: true },
        { id: "b", text: "Desloca para a esquerda", isCorrect: false },
        { id: "c", text: "Reduz o Emax sem deslocar", isCorrect: false },
        { id: "d", text: "Elimina completamente a resposta", isCorrect: false },
      ],
      explanation: "Antagonista competitivo desloca a curva para a direita (aumenta EC50) mas o Emax pode ser alcançado com doses maiores.",
    },
    {
      description: "A naloxona é antagonista de qual classe de receptores?",
      alternatives: [
        { id: "a", text: "Receptores muscarínicos", isCorrect: false },
        { id: "b", text: "Receptores opioides", isCorrect: true },
        { id: "c", text: "Receptores adrenérgicos", isCorrect: false },
        { id: "d", text: "Receptores GABAérgicos", isCorrect: false },
      ],
      explanation: "Naloxona é antagonista competitivo de receptores opioides, usada no tratamento de overdose por opioides.",
    },
  ],

  // ─── Quest 7: A Caverna do SNA Simpático (Semana 4) ───
  7: [
    {
      description: "Qual neurotransmissor é liberado nas terminações pós-ganglionares simpáticas?",
      alternatives: [
        { id: "a", text: "Acetilcolina", isCorrect: false },
        { id: "b", text: "Noradrenalina", isCorrect: true },
        { id: "c", text: "Dopamina", isCorrect: false },
        { id: "d", text: "Serotonina", isCorrect: false },
      ],
      explanation: "As fibras pós-ganglionares simpáticas liberam noradrenalina (exceto nas glândulas sudoríparas, que liberam ACh).",
    },
    {
      description: "Qual receptor adrenérgico, quando ativado, causa broncodilatação?",
      alternatives: [
        { id: "a", text: "α1", isCorrect: false },
        { id: "b", text: "α2", isCorrect: false },
        { id: "c", text: "β1", isCorrect: false },
        { id: "d", text: "β2", isCorrect: true },
      ],
      explanation: "Receptores β2-adrenérgicos nos brônquios causam relaxamento da musculatura lisa (broncodilatação).",
    },
    {
      description: "A resposta de 'luta ou fuga' é mediada por qual divisão do SNA?",
      alternatives: [
        { id: "a", text: "Parassimpático", isCorrect: false },
        { id: "b", text: "Simpático", isCorrect: true },
        { id: "c", text: "Entérico", isCorrect: false },
        { id: "d", text: "Somático", isCorrect: false },
      ],
      explanation: "O sistema nervoso simpático medeia a resposta de 'luta ou fuga' com liberação de adrenalina e noradrenalina.",
    },
    {
      description: "Qual é o efeito da ativação de receptores α1-adrenérgicos nos vasos sanguíneos?",
      alternatives: [
        { id: "a", text: "Vasodilatação", isCorrect: false },
        { id: "b", text: "Vasoconstrição", isCorrect: true },
        { id: "c", text: "Sem efeito", isCorrect: false },
        { id: "d", text: "Aumento da permeabilidade", isCorrect: false },
      ],
      explanation: "A ativação de receptores α1 na musculatura lisa vascular causa vasoconstrição e aumento da pressão arterial.",
    },
  ],

  // ─── Quest 8: O Rio dos Colinérgicos (Semana 4) ───
  8: [
    {
      description: "Qual enzima degrada a acetilcolina na fenda sináptica?",
      alternatives: [
        { id: "a", text: "MAO (monoamina oxidase)", isCorrect: false },
        { id: "b", text: "COMT", isCorrect: false },
        { id: "c", text: "Acetilcolinesterase", isCorrect: true },
        { id: "d", text: "Butirilcolinesterase", isCorrect: false },
      ],
      explanation: "A acetilcolinesterase (AChE) é a enzima principal que hidrolisa a ACh em colina e acetato na fenda sináptica.",
    },
    {
      description: "Qual é o mecanismo de ação dos organofosforados (pesticidas)?",
      alternatives: [
        { id: "a", text: "Bloqueio de receptores nicotínicos", isCorrect: false },
        { id: "b", text: "Inibição irreversível da acetilcolinesterase", isCorrect: true },
        { id: "c", text: "Estimulação direta de receptores muscarínicos", isCorrect: false },
        { id: "d", text: "Bloqueio da liberação de ACh", isCorrect: false },
      ],
      explanation: "Organofosforados inibem irreversivelmente a AChE, causando acúmulo de ACh e crise colinérgica.",
    },
    {
      description: "A atropina é usada como antídoto em intoxicação por organofosforados porque:",
      alternatives: [
        { id: "a", text: "Reativa a acetilcolinesterase", isCorrect: false },
        { id: "b", text: "Bloqueia receptores muscarínicos", isCorrect: true },
        { id: "c", text: "Degrada o organofosforado", isCorrect: false },
        { id: "d", text: "Aumenta a eliminação renal", isCorrect: false },
      ],
      explanation: "A atropina é antagonista muscarínico que bloqueia os efeitos do excesso de ACh nos receptores muscarínicos.",
    },
  ],

  // ─── Quest 9: O Vulcão dos Anestésicos Locais (Semana 5) ───
  9: [
    {
      description: "Qual é o mecanismo de ação dos anestésicos locais?",
      alternatives: [
        { id: "a", text: "Bloqueio de receptores de dor", isCorrect: false },
        { id: "b", text: "Bloqueio de canais de sódio voltagem-dependentes", isCorrect: true },
        { id: "c", text: "Ativação de receptores opioides locais", isCorrect: false },
        { id: "d", text: "Inibição da COX local", isCorrect: false },
      ],
      explanation: "Anestésicos locais bloqueiam canais de Na+ voltagem-dependentes, impedindo a condução do impulso nervoso.",
    },
    {
      description: "Por que a adrenalina é frequentemente adicionada a anestésicos locais?",
      alternatives: [
        { id: "a", text: "Para aumentar a potência do anestésico", isCorrect: false },
        { id: "b", text: "Para causar vasoconstrição e prolongar o efeito", isCorrect: true },
        { id: "c", text: "Para prevenir reações alérgicas", isCorrect: false },
        { id: "d", text: "Para reduzir a dor da injeção", isCorrect: false },
      ],
      explanation: "A adrenalina causa vasoconstrição local, reduzindo a absorção sistêmica e prolongando a duração do anestésico.",
    },
    {
      description: "Qual anestésico local é o único disponível na forma de éster ainda amplamente usado?",
      alternatives: [
        { id: "a", text: "Lidocaína", isCorrect: false },
        { id: "b", text: "Bupivacaína", isCorrect: false },
        { id: "c", text: "Procaína (Novocaína)", isCorrect: true },
        { id: "d", text: "Ropivacaína", isCorrect: false },
      ],
      explanation: "A procaína é um éster, enquanto lidocaína, bupivacaína e ropivacaína são amidas.",
    },
  ],

  // ─── Quest 10: A Geleira dos Anestésicos Gerais (Semana 5) ───
  10: [
    {
      description: "Qual é o estágio da anestesia geral em que ocorre excitação e delírio?",
      alternatives: [
        { id: "a", text: "Estágio I - Analgesia", isCorrect: false },
        { id: "b", text: "Estágio II - Excitação", isCorrect: true },
        { id: "c", text: "Estágio III - Anestesia cirúrgica", isCorrect: false },
        { id: "d", text: "Estágio IV - Depressão bulbar", isCorrect: false },
      ],
      explanation: "O Estágio II (excitação) é caracterizado por delírio, agitação e reflexos exacerbados. Deve ser ultrapassado rapidamente.",
    },
    {
      description: "O que significa CAM (Concentração Alveolar Mínima)?",
      alternatives: [
        { id: "a", text: "Concentração máxima tolerada pelo paciente", isCorrect: false },
        { id: "b", text: "Concentração que previne movimento em 50% dos pacientes", isCorrect: true },
        { id: "c", text: "Concentração mínima para induzir sono", isCorrect: false },
        { id: "d", text: "Concentração alveolar após 1 hora", isCorrect: false },
      ],
      explanation: "CAM é a concentração alveolar mínima que previne movimento em resposta a estímulo cirúrgico em 50% dos pacientes.",
    },
    {
      description: "Qual anestésico inalatório é o mais utilizado atualmente na prática clínica?",
      alternatives: [
        { id: "a", text: "Halotano", isCorrect: false },
        { id: "b", text: "Éter dietílico", isCorrect: false },
        { id: "c", text: "Sevoflurano", isCorrect: true },
        { id: "d", text: "Ciclopropano", isCorrect: false },
      ],
      explanation: "O sevoflurano é o mais usado atualmente por sua indução suave, baixa irritabilidade e rápida recuperação.",
    },
  ],

  // ─── Quest 11: O Labirinto dos Analgésicos (Semana 6) ───
  11: [
    {
      description: "Qual é o mecanismo de ação da morfina?",
      alternatives: [
        { id: "a", text: "Inibição da COX-1 e COX-2", isCorrect: false },
        { id: "b", text: "Agonismo de receptores μ-opioides", isCorrect: true },
        { id: "c", text: "Bloqueio de canais de sódio", isCorrect: false },
        { id: "d", text: "Inibição da recaptação de serotonina", isCorrect: false },
      ],
      explanation: "A morfina é agonista de receptores μ (mu) opioides, produzindo analgesia, euforia e depressão respiratória.",
    },
    {
      description: "Qual é o principal efeito adverso limitante dos opioides?",
      alternatives: [
        { id: "a", text: "Náusea", isCorrect: false },
        { id: "b", text: "Depressão respiratória", isCorrect: true },
        { id: "c", text: "Constipação", isCorrect: false },
        { id: "d", text: "Prurido", isCorrect: false },
      ],
      explanation: "A depressão respiratória é o efeito adverso mais grave e potencialmente fatal dos opioides.",
    },
    {
      description: "O tramadol tem mecanismo de ação dual. Além de agonismo opioide, ele também:",
      alternatives: [
        { id: "a", text: "Bloqueia canais de cálcio", isCorrect: false },
        { id: "b", text: "Inibe a recaptação de serotonina e noradrenalina", isCorrect: true },
        { id: "c", text: "Ativa receptores GABA", isCorrect: false },
        { id: "d", text: "Inibe a MAO", isCorrect: false },
      ],
      explanation: "O tramadol é agonista opioide fraco e também inibe a recaptação de 5-HT e NA, contribuindo para a analgesia.",
    },
  ],

  // ─── Quest 12: A Torre dos Anti-inflamatórios (Semana 7) ───
  12: [
    {
      description: "Qual é a principal diferença entre AINEs seletivos e não-seletivos?",
      alternatives: [
        { id: "a", text: "Seletivos inibem apenas COX-2, não-seletivos inibem COX-1 e COX-2", isCorrect: true },
        { id: "b", text: "Seletivos são mais potentes", isCorrect: false },
        { id: "c", text: "Não-seletivos têm menos efeitos colaterais", isCorrect: false },
        { id: "d", text: "Seletivos são todos de uso tópico", isCorrect: false },
      ],
      explanation: "AINEs seletivos (coxibes) inibem preferencialmente COX-2, reduzindo efeitos GI mas com risco cardiovascular.",
    },
    {
      description: "Por que o uso crônico de AINEs pode causar úlcera gástrica?",
      alternatives: [
        { id: "a", text: "Aumentam a secreção de ácido gástrico", isCorrect: false },
        { id: "b", text: "Inibem a COX-1 que produz prostaglandinas protetoras da mucosa", isCorrect: true },
        { id: "c", text: "Destroem diretamente a mucosa gástrica", isCorrect: false },
        { id: "d", text: "Reduzem o fluxo sanguíneo gástrico", isCorrect: false },
      ],
      explanation: "A inibição da COX-1 reduz prostaglandinas gastroprotetoras (PGE2), diminuindo muco e bicarbonato.",
    },
    {
      description: "Qual AINE é considerado o mais seguro para uso cardiovascular?",
      alternatives: [
        { id: "a", text: "Ibuprofeno", isCorrect: false },
        { id: "b", text: "Naproxeno", isCorrect: true },
        { id: "c", text: "Celecoxibe", isCorrect: false },
        { id: "d", text: "Diclofenaco", isCorrect: false },
      ],
      explanation: "O naproxeno é considerado o AINE com menor risco cardiovascular entre os disponíveis.",
    },
  ],

  // ─── Quest 13: O Pântano dos Antimicrobianos (Semana 8) ───
  13: [
    {
      description: "Qual é o mecanismo de ação das quinolonas (ciprofloxacino)?",
      alternatives: [
        { id: "a", text: "Inibição da síntese de parede celular", isCorrect: false },
        { id: "b", text: "Inibição da DNA girase e topoisomerase IV", isCorrect: true },
        { id: "c", text: "Inibição da síntese proteica no ribossomo 30S", isCorrect: false },
        { id: "d", text: "Inibição da síntese de ácido fólico", isCorrect: false },
      ],
      explanation: "Quinolonas inibem a DNA girase (Gram-) e topoisomerase IV (Gram+), impedindo a replicação do DNA bacteriano.",
    },
    {
      description: "O que é resistência bacteriana por produção de β-lactamases?",
      alternatives: [
        { id: "a", text: "Alteração do sítio de ligação do antibiótico", isCorrect: false },
        { id: "b", text: "Enzimas que destroem o anel β-lactâmico do antibiótico", isCorrect: true },
        { id: "c", text: "Bombas de efluxo que expulsam o antibiótico", isCorrect: false },
        { id: "d", text: "Diminuição da permeabilidade da membrana", isCorrect: false },
      ],
      explanation: "β-lactamases são enzimas bacterianas que hidrolisam o anel β-lactâmico, inativando penicilinas e cefalosporinas.",
    },
    {
      description: "Qual antibiótico é bacteriostático e inibe a síntese proteica na subunidade 50S?",
      alternatives: [
        { id: "a", text: "Amoxicilina", isCorrect: false },
        { id: "b", text: "Gentamicina", isCorrect: false },
        { id: "c", text: "Azitromicina", isCorrect: true },
        { id: "d", text: "Vancomicina", isCorrect: false },
      ],
      explanation: "Macrolídeos (azitromicina, eritromicina) são bacteriostáticos que inibem a subunidade 50S ribossomal.",
    },
  ],

  // ─── Quest 14: A Montanha dos Cardiovasculares (Semana 9) ───
  14: [
    {
      description: "Qual é o mecanismo de ação dos β-bloqueadores no tratamento da hipertensão?",
      alternatives: [
        { id: "a", text: "Vasodilatação direta", isCorrect: false },
        { id: "b", text: "Redução do débito cardíaco e da liberação de renina", isCorrect: true },
        { id: "c", text: "Aumento da excreção de sódio", isCorrect: false },
        { id: "d", text: "Bloqueio de canais de cálcio", isCorrect: false },
      ],
      explanation: "β-bloqueadores reduzem a frequência cardíaca, o débito cardíaco e a secreção de renina, diminuindo a PA.",
    },
    {
      description: "Qual diurético é mais usado como primeira linha no tratamento da hipertensão?",
      alternatives: [
        { id: "a", text: "Furosemida", isCorrect: false },
        { id: "b", text: "Hidroclorotiazida", isCorrect: true },
        { id: "c", text: "Espironolactona", isCorrect: false },
        { id: "d", text: "Manitol", isCorrect: false },
      ],
      explanation: "Tiazídicos (hidroclorotiazida) são primeira linha para hipertensão por eficácia, baixo custo e perfil de segurança.",
    },
    {
      description: "Qual é o principal efeito adverso dos IECAs que leva à troca por BRAs?",
      alternatives: [
        { id: "a", text: "Hipotensão", isCorrect: false },
        { id: "b", text: "Tosse seca persistente", isCorrect: true },
        { id: "c", text: "Edema de membros", isCorrect: false },
        { id: "d", text: "Bradicardia", isCorrect: false },
      ],
      explanation: "A tosse seca por acúmulo de bradicinina é o efeito adverso mais comum dos IECAs, levando à substituição por BRAs.",
    },
  ],

  // ─── Quest 15: O Abismo dos Psicotrópicos (Semana 9) ───
  15: [
    {
      description: "Qual classe de fármacos é primeira linha no tratamento da depressão?",
      alternatives: [
        { id: "a", text: "Antidepressivos tricíclicos", isCorrect: false },
        { id: "b", text: "ISRSs (Inibidores Seletivos da Recaptação de Serotonina)", isCorrect: true },
        { id: "c", text: "IMAOs", isCorrect: false },
        { id: "d", text: "Benzodiazepínicos", isCorrect: false },
      ],
      explanation: "ISRSs (fluoxetina, sertralina) são primeira linha por eficácia, tolerabilidade e segurança em overdose.",
    },
    {
      description: "Qual neurotransmissor está em excesso na esquizofrenia segundo a hipótese dopaminérgica?",
      alternatives: [
        { id: "a", text: "Serotonina", isCorrect: false },
        { id: "b", text: "GABA", isCorrect: false },
        { id: "c", text: "Dopamina", isCorrect: true },
        { id: "d", text: "Glutamato", isCorrect: false },
      ],
      explanation: "A hipótese dopaminérgica propõe excesso de dopamina na via mesolímbica como base dos sintomas positivos.",
    },
    {
      description: "Qual é o mecanismo de ação dos benzodiazepínicos?",
      alternatives: [
        { id: "a", text: "Bloqueio de receptores de dopamina", isCorrect: false },
        { id: "b", text: "Potencialização da ação do GABA no receptor GABA-A", isCorrect: true },
        { id: "c", text: "Inibição da recaptação de serotonina", isCorrect: false },
        { id: "d", text: "Bloqueio de canais de sódio", isCorrect: false },
      ],
      explanation: "Benzodiazepínicos se ligam ao receptor GABA-A, aumentando a frequência de abertura do canal de cloreto.",
    },
  ],

  // ─── Quest 16: O Portal de Retorno - Boss Final (Semana 10) ───
  16: [
    {
      description: "Qual é a principal via de excreção de fármacos e seus metabólitos?",
      alternatives: [
        { id: "a", text: "Via biliar", isCorrect: false },
        { id: "b", text: "Via renal", isCorrect: true },
        { id: "c", text: "Via pulmonar", isCorrect: false },
        { id: "d", text: "Via cutânea", isCorrect: false },
      ],
      explanation: "A via renal é a principal via de excreção de fármacos, através de filtração glomerular, secreção tubular e reabsorção.",
    },
    {
      description: "O que são reações de Fase I do metabolismo hepático?",
      alternatives: [
        { id: "a", text: "Conjugação com ácido glicurônico", isCorrect: false },
        { id: "b", text: "Oxidação, redução e hidrólise pelo citocromo P450", isCorrect: true },
        { id: "c", text: "Acetilação e metilação", isCorrect: false },
        { id: "d", text: "Ligação a proteínas plasmáticas", isCorrect: false },
      ],
      explanation: "Reações de Fase I (funcionalização) envolvem oxidação, redução e hidrólise, principalmente pelo sistema CYP450.",
    },
    {
      description: "Qual é a importância clínica das interações medicamentosas envolvendo o CYP3A4?",
      alternatives: [
        { id: "a", text: "CYP3A4 metaboliza apenas 5% dos fármacos", isCorrect: false },
        { id: "b", text: "CYP3A4 metaboliza ~50% dos fármacos, tornando interações muito comuns", isCorrect: true },
        { id: "c", text: "CYP3A4 é encontrado apenas nos rins", isCorrect: false },
        { id: "d", text: "CYP3A4 não é afetado por indutores ou inibidores", isCorrect: false },
      ],
      explanation: "CYP3A4 é responsável pelo metabolismo de ~50% dos fármacos, tornando-o o principal alvo de interações medicamentosas.",
    },
  ],
};
