import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield, Sword, Heart, Zap, Star, Trophy, Skull,
  ArrowLeft, Timer, Flame, ChevronRight, AlertTriangle, RotateCcw
} from "lucide-react";

// ═══════════════════════════════════════
// BOSS DATA - 10 bosses, 1 per week
// ═══════════════════════════════════════

interface BossQuestion {
  question: string;
  alternatives: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface BossPhase {
  name: string;
  questions: BossQuestion[];
}

interface BossData {
  id: number;
  weekNumber: number;
  name: string;
  title: string;
  emoji: string;
  imageUrl?: string;
  color: string;
  hp: number;
  playerHp: number;
  pfReward: number;
  xpReward: number;
  phases: BossPhase[];
}

const BOSSES: BossData[] = [
  {
    id: 1, weekNumber: 1, name: "Guardião do Portal", title: "Sentinela da Farmacocinética",
    emoji: "🛡️", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/JbsXuycNvrmiUuhC.png", color: "#3b82f6", hp: 300, playerHp: 100, pfReward: 25, xpReward: 200,
    phases: [
      { name: "Absorção", questions: [
        { question: "Qual via de administração tem 100% de biodisponibilidade?", alternatives: [{ id: "a", text: "Oral" }, { id: "b", text: "Intravenosa" }, { id: "c", text: "Sublingual" }, { id: "d", text: "Retal" }], correctAnswer: "b", explanation: "A via IV injeta o fármaco diretamente na corrente sanguínea, garantindo biodisponibilidade de 100%." },
        { question: "O que é efeito de primeira passagem?", alternatives: [{ id: "a", text: "Metabolismo hepático antes de atingir a circulação sistêmica" }, { id: "b", text: "Absorção no estômago" }, { id: "c", text: "Excreção renal imediata" }, { id: "d", text: "Ligação a proteínas plasmáticas" }], correctAnswer: "a", explanation: "O efeito de primeira passagem é o metabolismo do fármaco pelo fígado antes de alcançar a circulação sistêmica." },
      ]},
      { name: "Distribuição", questions: [
        { question: "Qual fator AUMENTA o volume de distribuição de um fármaco?", alternatives: [{ id: "a", text: "Alta ligação a proteínas plasmáticas" }, { id: "b", text: "Alta lipossolubilidade" }, { id: "c", text: "Baixo peso molecular apenas" }, { id: "d", text: "Alta ionização em pH fisiológico" }], correctAnswer: "b", explanation: "Fármacos lipofílicos se distribuem amplamente pelos tecidos, aumentando o Vd." },
      ]},
      { name: "Eliminação", questions: [
        { question: "O que representa a meia-vida (t½) de um fármaco?", alternatives: [{ id: "a", text: "Tempo para absorver 50% da dose" }, { id: "b", text: "Tempo para a concentração plasmática cair pela metade" }, { id: "c", text: "Tempo para atingir o pico plasmático" }, { id: "d", text: "Tempo para excretar 100% do fármaco" }], correctAnswer: "b", explanation: "A meia-vida é o tempo necessário para que a concentração plasmática do fármaco seja reduzida em 50%." },
      ]},
    ],
  },
  {
    id: 2, weekNumber: 2, name: "Quimera dos Receptores", title: "Besta da Farmacodinâmica",
    emoji: "🐲", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/mEsWljGyRXvvuUgf.png", color: "#8b5cf6", hp: 350, playerHp: 100, pfReward: 30, xpReward: 250,
    phases: [
      { name: "Receptores", questions: [
        { question: "Qual tipo de receptor tem ação mais RÁPIDA?", alternatives: [{ id: "a", text: "Receptor acoplado a proteína G" }, { id: "b", text: "Canal iônico regulado por ligante" }, { id: "c", text: "Receptor nuclear" }, { id: "d", text: "Receptor tirosina quinase" }], correctAnswer: "b", explanation: "Canais iônicos regulados por ligante abrem em milissegundos, sendo os mais rápidos." },
        { question: "O que é potência de um fármaco?", alternatives: [{ id: "a", text: "Efeito máximo que o fármaco produz" }, { id: "b", text: "Concentração necessária para produzir 50% do efeito máximo (EC50)" }, { id: "c", text: "Velocidade de absorção" }, { id: "d", text: "Duração do efeito" }], correctAnswer: "b", explanation: "Potência refere-se à EC50: quanto menor, mais potente o fármaco." },
      ]},
      { name: "Agonistas", questions: [
        { question: "Um agonista parcial, comparado a um agonista total, tem:", alternatives: [{ id: "a", text: "Maior eficácia máxima" }, { id: "b", text: "Menor eficácia máxima" }, { id: "c", text: "Mesma eficácia, menor potência" }, { id: "d", text: "Nenhum efeito" }], correctAnswer: "b", explanation: "Agonistas parciais não conseguem produzir o efeito máximo mesmo em doses altas." },
      ]},
      { name: "Antagonistas", questions: [
        { question: "Um antagonista competitivo reversível pode ser superado por:", alternatives: [{ id: "a", text: "Diminuir a dose do agonista" }, { id: "b", text: "Aumentar a concentração do agonista" }, { id: "c", text: "Adicionar outro antagonista" }, { id: "d", text: "Nada, o bloqueio é permanente" }], correctAnswer: "b", explanation: "Antagonistas competitivos reversíveis competem pelo mesmo sítio; aumentar o agonista desloca o equilíbrio." },
      ]},
    ],
  },
  {
    id: 3, weekNumber: 3, name: "Hidra Autonômica", title: "Serpente do SNA",
    emoji: "🐍", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/jPOGVblAgLnIiLdt.png", color: "#10b981", hp: 400, playerHp: 100, pfReward: 35, xpReward: 300,
    phases: [
      { name: "Simpático", questions: [
        { question: "Qual neurotransmissor é liberado pelos neurônios simpáticos PÓS-ganglionares?", alternatives: [{ id: "a", text: "Acetilcolina" }, { id: "b", text: "Noradrenalina" }, { id: "c", text: "Dopamina" }, { id: "d", text: "Serotonina" }], correctAnswer: "b", explanation: "Os neurônios simpáticos pós-ganglionares liberam noradrenalina (exceto glândulas sudoríparas)." },
        { question: "A ativação simpática causa qual efeito no coração?", alternatives: [{ id: "a", text: "Bradicardia" }, { id: "b", text: "Taquicardia" }, { id: "c", text: "Nenhum efeito" }, { id: "d", text: "Arritmia sempre" }], correctAnswer: "b", explanation: "A estimulação simpática via receptores β1 aumenta a frequência e a força de contração cardíaca." },
      ]},
      { name: "Parassimpático", questions: [
        { question: "Qual receptor é responsável pela bradicardia induzida pela acetilcolina no coração?", alternatives: [{ id: "a", text: "Nicotínico" }, { id: "b", text: "Muscarínico M2" }, { id: "c", text: "Muscarínico M1" }, { id: "d", text: "Beta-1 adrenérgico" }], correctAnswer: "b", explanation: "Receptores M2 no coração reduzem a frequência cardíaca quando ativados pela ACh." },
      ]},
      { name: "Integração", questions: [
        { question: "A atropina bloqueia receptores muscarínicos. Qual efeito ela causa no olho?", alternatives: [{ id: "a", text: "Miose" }, { id: "b", text: "Midríase" }, { id: "c", text: "Nenhum efeito" }, { id: "d", text: "Aumento da pressão intraocular apenas" }], correctAnswer: "b", explanation: "A atropina bloqueia M3 no músculo esfíncter da pupila, causando midríase (dilatação)." },
      ]},
    ],
  },
  {
    id: 4, weekNumber: 4, name: "Venger, o Senhor Colinérgico", title: "Mestre dos Receptores Muscarínicos",
    emoji: "😈", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/IJclFIdvDkbZLdKj.png", color: "#ef4444", hp: 450, playerHp: 100, pfReward: 40, xpReward: 350,
    phases: [
      { name: "Colinérgicos Diretos", questions: [
        { question: "Qual fármaco colinérgico é usado no tratamento do glaucoma?", alternatives: [{ id: "a", text: "Atropina" }, { id: "b", text: "Pilocarpina" }, { id: "c", text: "Tubocurarina" }, { id: "d", text: "Adrenalina" }], correctAnswer: "b", explanation: "A pilocarpina é um agonista muscarínico que contrai o músculo ciliar, facilitando a drenagem do humor aquoso." },
        { question: "A betanecol é usada para tratar:", alternatives: [{ id: "a", text: "Hipertensão" }, { id: "b", text: "Retenção urinária pós-operatória" }, { id: "c", text: "Asma" }, { id: "d", text: "Taquicardia" }], correctAnswer: "b", explanation: "A betanecol estimula receptores M3 na bexiga, promovendo contração do detrusor." },
      ]},
      { name: "Anticolinesterásicos", questions: [
        { question: "Qual anticolinesterásico é usado no tratamento da miastenia gravis?", alternatives: [{ id: "a", text: "Donepezila" }, { id: "b", text: "Neostigmina" }, { id: "c", text: "Sarin" }, { id: "d", text: "Atropina" }], correctAnswer: "b", explanation: "A neostigmina inibe reversivelmente a AChE, aumentando a ACh na junção neuromuscular." },
      ]},
      { name: "Anticolinérgicos", questions: [
        { question: "O ipratrópio é usado na asma porque:", alternatives: [{ id: "a", text: "Estimula receptores β2" }, { id: "b", text: "Bloqueia receptores muscarínicos nos brônquios" }, { id: "c", text: "Inibe a fosfodiesterase" }, { id: "d", text: "Bloqueia receptores H1" }], correctAnswer: "b", explanation: "O ipratrópio é um antagonista muscarínico que causa broncodilatação ao bloquear M3 nos brônquios." },
      ]},
    ],
  },
  {
    id: 5, weekNumber: 5, name: "Tiamat, Dragão Adrenérgico", title: "As 5 Cabeças dos Receptores Adrenérgicos",
    emoji: "🐉", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/EcTqzpkeXTPMTrZC.png", color: "#f59e0b", hp: 500, playerHp: 100, pfReward: 45, xpReward: 400,
    phases: [
      { name: "Agonistas Adrenérgicos", questions: [
        { question: "A adrenalina ativa quais receptores?", alternatives: [{ id: "a", text: "Apenas α1" }, { id: "b", text: "Apenas β1 e β2" }, { id: "c", text: "Todos os receptores adrenérgicos (α e β)" }, { id: "d", text: "Apenas receptores muscarínicos" }], correctAnswer: "c", explanation: "A adrenalina é um agonista não-seletivo que ativa todos os receptores α e β adrenérgicos." },
        { question: "Qual agonista β2 seletivo é usado como broncodilatador na asma?", alternatives: [{ id: "a", text: "Propranolol" }, { id: "b", text: "Salbutamol" }, { id: "c", text: "Fenilefrina" }, { id: "d", text: "Clonidina" }], correctAnswer: "b", explanation: "O salbutamol é um agonista β2 seletivo que relaxa a musculatura brônquica." },
      ]},
      { name: "Antagonistas α", questions: [
        { question: "A prazosina é usada na hipertensão porque bloqueia receptores:", alternatives: [{ id: "a", text: "β1 cardíacos" }, { id: "b", text: "α1 vasculares" }, { id: "c", text: "α2 pré-sinápticos" }, { id: "d", text: "β2 brônquicos" }], correctAnswer: "b", explanation: "A prazosina bloqueia α1 nos vasos, causando vasodilatação e redução da pressão arterial." },
      ]},
      { name: "Antagonistas β", questions: [
        { question: "Por que o propranolol é CONTRAINDICADO em asmáticos?", alternatives: [{ id: "a", text: "Causa taquicardia" }, { id: "b", text: "Bloqueia β2 nos brônquios, causando broncoconstrição" }, { id: "c", text: "Aumenta a pressão arterial" }, { id: "d", text: "Causa hipoglicemia sempre" }], correctAnswer: "b", explanation: "O propranolol é não-seletivo e bloqueia β2 brônquicos, podendo precipitar broncoespasmo em asmáticos." },
      ]},
    ],
  },
  {
    id: 6, weekNumber: 6, name: "Espectro do Sono", title: "Fantasma dos Anestésicos",
    emoji: "👻", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/ZzpfcLIlXJIelFeC.png", color: "#6366f1", hp: 500, playerHp: 100, pfReward: 45, xpReward: 400,
    phases: [
      { name: "Anestésicos Gerais", questions: [
        { question: "Qual anestésico inalatório tem o MENOR coeficiente de partição sangue/gás (indução mais rápida)?", alternatives: [{ id: "a", text: "Halotano" }, { id: "b", text: "Desflurano" }, { id: "c", text: "Isoflurano" }, { id: "d", text: "Éter" }], correctAnswer: "b", explanation: "O desflurano tem baixo coeficiente de partição sangue/gás, permitindo indução e recuperação rápidas." },
        { question: "O propofol é amplamente usado na indução anestésica porque:", alternatives: [{ id: "a", text: "Tem longa duração de ação" }, { id: "b", text: "Tem início de ação rápido e recuperação suave" }, { id: "c", text: "É um analgésico potente" }, { id: "d", text: "Não causa depressão respiratória" }], correctAnswer: "b", explanation: "O propofol tem início rápido (30-40s IV) e recuperação suave sem náuseas." },
      ]},
      { name: "Anestésicos Locais", questions: [
        { question: "Os anestésicos locais bloqueiam a condução nervosa por:", alternatives: [{ id: "a", text: "Ativar canais de potássio" }, { id: "b", text: "Bloquear canais de sódio voltagem-dependentes" }, { id: "c", text: "Estimular receptores GABA" }, { id: "d", text: "Inibir a liberação de acetilcolina" }], correctAnswer: "b", explanation: "Anestésicos locais bloqueiam canais de Na+ voltagem-dependentes, impedindo a propagação do potencial de ação." },
      ]},
      { name: "Relaxantes Musculares", questions: [
        { question: "A succinilcolina é um bloqueador neuromuscular do tipo:", alternatives: [{ id: "a", text: "Não-despolarizante" }, { id: "b", text: "Despolarizante" }, { id: "c", text: "Competitivo reversível" }, { id: "d", text: "Anticolinesterásico" }], correctAnswer: "b", explanation: "A succinilcolina é um agonista nicotínico que causa despolarização sustentada, resultando em paralisia." },
      ]},
    ],
  },
  {
    id: 7, weekNumber: 7, name: "Golem da Dor", title: "Colosso dos Analgésicos",
    emoji: "🗿", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/NVIMkchXBsjsYLWQ.png", color: "#dc2626", hp: 550, playerHp: 100, pfReward: 50, xpReward: 450,
    phases: [
      { name: "Opioides", questions: [
        { question: "A morfina exerce seu efeito analgésico principalmente através de receptores:", alternatives: [{ id: "a", text: "μ (mu)" }, { id: "b", text: "δ (delta)" }, { id: "c", text: "κ (kappa)" }, { id: "d", text: "NMDA" }], correctAnswer: "a", explanation: "Os receptores μ são os principais responsáveis pela analgesia, euforia e depressão respiratória dos opioides." },
        { question: "Qual fármaco é o antídoto para overdose de opioides?", alternatives: [{ id: "a", text: "Flumazenil" }, { id: "b", text: "Naloxona" }, { id: "c", text: "Atropina" }, { id: "d", text: "N-acetilcisteína" }], correctAnswer: "b", explanation: "A naloxona é um antagonista competitivo dos receptores opioides, revertendo rapidamente a depressão respiratória." },
      ]},
      { name: "AINEs", questions: [
        { question: "Os AINEs tradicionais inibem:", alternatives: [{ id: "a", text: "Apenas COX-1" }, { id: "b", text: "Apenas COX-2" }, { id: "c", text: "COX-1 e COX-2" }, { id: "d", text: "Lipoxigenase" }], correctAnswer: "c", explanation: "AINEs tradicionais como ibuprofeno e naproxeno inibem tanto COX-1 quanto COX-2." },
      ]},
      { name: "Adjuvantes", questions: [
        { question: "O paracetamol (acetaminofeno) em overdose causa lesão principalmente em qual órgão?", alternatives: [{ id: "a", text: "Rins" }, { id: "b", text: "Fígado" }, { id: "c", text: "Coração" }, { id: "d", text: "Pulmões" }], correctAnswer: "b", explanation: "O metabólito tóxico NAPQI causa necrose hepática. O antídoto é N-acetilcisteína." },
      ]},
    ],
  },
  {
    id: 8, weekNumber: 8, name: "Fênix Inflamatória", title: "Ave de Fogo Anti-inflamatória",
    emoji: "🔥", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/UBudIpcKSKWfhfCp.png", color: "#f97316", hp: 550, playerHp: 100, pfReward: 50, xpReward: 450,
    phases: [
      { name: "Corticosteroides", questions: [
        { question: "Os glicocorticoides exercem efeito anti-inflamatório principalmente por:", alternatives: [{ id: "a", text: "Inibir a fosfolipase A2 via lipocortina" }, { id: "b", text: "Bloquear receptores de histamina" }, { id: "c", text: "Inibir apenas a COX-2" }, { id: "d", text: "Ativar receptores β2" }], correctAnswer: "a", explanation: "Glicocorticoides induzem lipocortina que inibe a fosfolipase A2, reduzindo prostaglandinas e leucotrienos." },
        { question: "Qual é um efeito adverso do uso crônico de corticosteroides?", alternatives: [{ id: "a", text: "Hipoglicemia" }, { id: "b", text: "Osteoporose" }, { id: "c", text: "Hipotensão" }, { id: "d", text: "Ganho de massa muscular" }], correctAnswer: "b", explanation: "O uso crônico causa osteoporose, síndrome de Cushing, hiperglicemia e imunossupressão." },
      ]},
      { name: "Anti-histamínicos", questions: [
        { question: "Por que a loratadina causa MENOS sonolência que a difenidramina?", alternatives: [{ id: "a", text: "Não bloqueia receptores H1" }, { id: "b", text: "Não atravessa a barreira hematoencefálica significativamente" }, { id: "c", text: "É um agonista H1" }, { id: "d", text: "Atua apenas em receptores H2" }], correctAnswer: "b", explanation: "Anti-histamínicos de 2ª geração como loratadina são menos lipofílicos e penetram pouco no SNC." },
      ]},
      { name: "Imunomoduladores", questions: [
        { question: "O metotrexato, usado em artrite reumatoide, atua como:", alternatives: [{ id: "a", text: "Antagonista de TNF-α" }, { id: "b", text: "Inibidor da di-hidrofolato redutase" }, { id: "c", text: "Agonista de corticosteroides" }, { id: "d", text: "Bloqueador de IL-6" }], correctAnswer: "b", explanation: "O metotrexato inibe a DHFR, reduzindo a síntese de purinas e a proliferação de células imunes." },
      ]},
    ],
  },
  {
    id: 9, weekNumber: 9, name: "Praga Bacteriana", title: "Enxame dos Antimicrobianos",
    emoji: "🦠", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/saoQUPkDvEHxSsfW.png", color: "#14b8a6", hp: 600, playerHp: 100, pfReward: 55, xpReward: 500,
    phases: [
      { name: "β-Lactâmicos", questions: [
        { question: "As penicilinas atuam inibindo:", alternatives: [{ id: "a", text: "A síntese proteica no ribossomo 30S" }, { id: "b", text: "A síntese da parede celular (transpeptidases/PBPs)" }, { id: "c", text: "A síntese de ácido fólico" }, { id: "d", text: "A DNA girase" }], correctAnswer: "b", explanation: "β-lactâmicos inibem as transpeptidases (PBPs), impedindo a síntese de peptidoglicano da parede celular." },
        { question: "A associação amoxicilina + ácido clavulânico é útil porque:", alternatives: [{ id: "a", text: "O ácido clavulânico é um antibiótico mais potente" }, { id: "b", text: "O ácido clavulânico inibe β-lactamases bacterianas" }, { id: "c", text: "Aumenta a absorção oral" }, { id: "d", text: "Reduz efeitos colaterais" }], correctAnswer: "b", explanation: "O ácido clavulânico é um inibidor de β-lactamases, protegendo a amoxicilina da degradação enzimática." },
      ]},
      { name: "Quinolonas e Macrolídeos", questions: [
        { question: "As fluoroquinolonas (ciprofloxacino) atuam inibindo:", alternatives: [{ id: "a", text: "A síntese da parede celular" }, { id: "b", text: "A DNA girase e topoisomerase IV" }, { id: "c", text: "A síntese de ácido fólico" }, { id: "d", text: "A membrana celular" }], correctAnswer: "b", explanation: "Fluoroquinolonas inibem a DNA girase (gram-negativos) e topoisomerase IV (gram-positivos)." },
      ]},
      { name: "Resistência", questions: [
        { question: "Qual é o principal mecanismo de resistência do MRSA aos β-lactâmicos?", alternatives: [{ id: "a", text: "Produção de β-lactamases apenas" }, { id: "b", text: "Alteração do alvo (PBP2a codificada pelo gene mecA)" }, { id: "c", text: "Bomba de efluxo" }, { id: "d", text: "Impermeabilidade da membrana" }], correctAnswer: "b", explanation: "MRSA possui o gene mecA que codifica PBP2a, uma transpeptidase com baixa afinidade por β-lactâmicos." },
      ]},
    ],
  },
  {
    id: 10, weekNumber: 10, name: "Tiamat Supremo", title: "O Dragão Final da Farmacologia",
    emoji: "🐲", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/wBoAgOslFPfCwoXg.png", color: "#dc2626", hp: 700, playerHp: 100, pfReward: 75, xpReward: 600,
    phases: [
      { name: "Revisão Geral I", questions: [
        { question: "Um paciente asmático precisa de um anti-hipertensivo. Qual β-bloqueador é MAIS seguro?", alternatives: [{ id: "a", text: "Propranolol" }, { id: "b", text: "Atenolol (β1-seletivo)" }, { id: "c", text: "Timolol" }, { id: "d", text: "Nadolol" }], correctAnswer: "b", explanation: "Atenolol é β1-seletivo, tendo menor risco de broncoconstrição que β-bloqueadores não-seletivos." },
        { question: "Qual fármaco é usado para reverter intoxicação por benzodiazepínicos?", alternatives: [{ id: "a", text: "Naloxona" }, { id: "b", text: "Flumazenil" }, { id: "c", text: "N-acetilcisteína" }, { id: "d", text: "Atropina" }], correctAnswer: "b", explanation: "Flumazenil é antagonista competitivo do sítio benzodiazepínico no receptor GABA-A." },
      ]},
      { name: "Revisão Geral II", questions: [
        { question: "A resistência bacteriana por produção de β-lactamases pode ser contornada com:", alternatives: [{ id: "a", text: "Aumento da dose do antibiótico" }, { id: "b", text: "Associação com inibidores de β-lactamase (ex: ácido clavulânico)" }, { id: "c", text: "Troca por um macrolídeo sempre" }, { id: "d", text: "Uso de anti-inflamatórios" }], correctAnswer: "b", explanation: "Inibidores de β-lactamase protegem o antibiótico da degradação enzimática." },
      ]},
      { name: "Caso Clínico Final", questions: [
        { question: "Paciente com choque anafilático. Qual é o fármaco de PRIMEIRA escolha?", alternatives: [{ id: "a", text: "Difenidramina" }, { id: "b", text: "Adrenalina (epinefrina) IM" }, { id: "c", text: "Hidrocortisona" }, { id: "d", text: "Salbutamol" }], correctAnswer: "b", explanation: "A adrenalina IM é o tratamento de primeira linha na anafilaxia: reverte broncoespasmo, hipotensão e edema." },
      ]},
    ],
  },
];

// ═══════════════════════════════════════
// BOSS BATTLE COMPONENT
// ═══════════════════════════════════════

export interface BossBattleProps {
  weekNumber: number;
  onComplete: (result: {
    isVictory: boolean;
    bossName: string;
    totalDamageDealt: number;
    playerHpRemaining: number;
    phasesCompleted: number;
    totalPhases: number;
    comboMax: number;
    pfEarned: number;
    xpEarned: number;
    totalTimeSpent: number;
  }) => void;
  onBack: () => void;
}

export default function BossBattle({ weekNumber, onComplete, onBack }: BossBattleProps) {
  const boss = useMemo(() => BOSSES.find(b => b.weekNumber === weekNumber), [weekNumber]);
  
  const [phase, setPhase] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [bossHp, setBossHp] = useState(boss?.hp || 300);
  const [playerHp, setPlayerHp] = useState(boss?.playerHp || 100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalDamage, setTotalDamage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [battleState, setBattleState] = useState<"fighting" | "victory" | "defeat">("fighting");
  const [startTime] = useState(Date.now());
  const [shakeScreen, setShakeScreen] = useState(false);
  const [flashDamage, setFlashDamage] = useState(false);
  const [phasesCompleted, setPhasesCompleted] = useState(0);

  if (!boss) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">Boss não encontrado para a semana {weekNumber}</p>
          <Button onClick={onBack} className="mt-4">Voltar</Button>
        </div>
      </div>
    );
  }

  const currentPhase = boss.phases[phase];
  const currentQuestion = currentPhase?.questions[questionIdx];
  const totalQuestions = boss.phases.reduce((sum, p) => sum + p.questions.length, 0);
  const bossHpPercent = (bossHp / boss.hp) * 100;
  const playerHpPercent = (playerHp / boss.playerHp) * 100;

  // Timer
  useEffect(() => {
    if (!timerActive || battleState !== "fighting") return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, battleState]);

  const handleTimeout = useCallback(() => {
    setTimerActive(false);
    setIsCorrect(false);
    setShowFeedback(true);
    setCombo(0);
    
    const bossDamage = 25;
    const newPlayerHp = Math.max(0, playerHp - bossDamage);
    setPlayerHp(newPlayerHp);
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);
    
    if (newPlayerHp <= 0) {
      setBattleState("defeat");
    }
  }, [playerHp]);

  const handleAnswer = (answerId: string) => {
    if (showFeedback || !currentQuestion) return;
    setTimerActive(false);
    setSelectedAnswer(answerId);

    const correct = answerId === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const baseAttack = Math.floor(boss.hp / totalQuestions);
      const comboBonus = Math.floor(baseAttack * combo * 0.15);
      const timeBonus = Math.floor(timeLeft * 1.5);
      const totalAttack = baseAttack + comboBonus + timeBonus;
      
      const newBossHp = Math.max(0, bossHp - totalAttack);
      setBossHp(newBossHp);
      setTotalDamage(prev => prev + totalAttack);
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(mc => Math.max(mc, newCombo));
        return newCombo;
      });
      setFlashDamage(true);
      setTimeout(() => setFlashDamage(false), 400);
    } else {
      const bossDamage = 20;
      const newPlayerHp = Math.max(0, playerHp - bossDamage);
      setPlayerHp(newPlayerHp);
      setCombo(0);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);
      
      if (newPlayerHp <= 0) {
        setBattleState("defeat");
        return;
      }
    }
  };

  const handleNext = () => {
    if (bossHp <= 0) {
      setBattleState("victory");
      setPhasesCompleted(phase + 1);
      return;
    }

    if (questionIdx < (currentPhase?.questions.length || 0) - 1) {
      setQuestionIdx(prev => prev + 1);
    } else if (phase < boss.phases.length - 1) {
      setPhasesCompleted(prev => prev + 1);
      setPhase(prev => prev + 1);
      setQuestionIdx(0);
    } else {
      setBattleState("defeat");
      setPhasesCompleted(boss.phases.length);
      return;
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(30);
    setTimerActive(true);
  };

  const handleBattleEnd = () => {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    onComplete({
      isVictory: battleState === "victory",
      bossName: boss.name,
      totalDamageDealt: totalDamage,
      playerHpRemaining: playerHp,
      phasesCompleted: phasesCompleted,
      totalPhases: boss.phases.length,
      comboMax: maxCombo,
      pfEarned: battleState === "victory" ? boss.pfReward : Math.floor(boss.pfReward * 0.2),
      xpEarned: battleState === "victory" ? boss.xpReward : Math.floor(boss.xpReward * 0.2),
      totalTimeSpent: totalTime,
    });
  };

  // ═══════════════════════════════════════
  // VICTORY SCREEN
  // ═══════════════════════════════════════
  if (battleState === "victory") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1040] to-[#0a0e27] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            {boss.imageUrl ? (
              <img src={boss.imageUrl} alt={boss.name} className="w-40 h-40 object-contain mx-auto mb-4 animate-bounce drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
            ) : (
              <div className="text-8xl mb-4 animate-bounce">{boss.emoji}</div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-yellow-500/20 animate-ping" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-extrabold text-yellow-400">VITÓRIA! 🏆</h1>
            <p className="text-lg text-gray-300 mt-2">{boss.name} foi derrotado!</p>
          </div>

          <div className="bg-white/5 border border-yellow-500/30 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Zap size={24} className="text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-mono font-bold text-blue-400">+{boss.pfReward}</p>
                <p className="text-xs text-gray-400">PF Ganhos</p>
              </div>
              <div className="text-center">
                <Star size={24} className="text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-mono font-bold text-purple-400">+{boss.xpReward}</p>
                <p className="text-xs text-gray-400">PF Ganhos</p>
              </div>
              <div className="text-center">
                <Flame size={24} className="text-orange-400 mx-auto mb-1" />
                <p className="text-2xl font-mono font-bold text-orange-400">{maxCombo}x</p>
                <p className="text-xs text-gray-400">Combo Máximo</p>
              </div>
              <div className="text-center">
                <Sword size={24} className="text-red-400 mx-auto mb-1" />
                <p className="text-2xl font-mono font-bold text-red-400">{totalDamage}</p>
                <p className="text-xs text-gray-400">Dano Total</p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">HP Restante</span>
                <span className="text-emerald-400 font-mono">{playerHp}/{boss.playerHp}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Fases Completadas</span>
                <span className="text-emerald-400 font-mono">{phasesCompleted}/{boss.phases.length}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBattleEnd}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold text-lg py-6"
          >
            <Trophy size={20} className="mr-2" /> Resgatar Recompensas
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DEFEAT SCREEN
  // ═══════════════════════════════════════
  if (battleState === "defeat") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#2a0a0a] to-[#0a0e27] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {boss.imageUrl ? (
            <img src={boss.imageUrl} alt={boss.name} className="w-40 h-40 object-contain mx-auto mb-4 opacity-50 grayscale drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
          ) : (
            <div className="text-8xl mb-4 opacity-50">{boss.emoji}</div>
          )}
          
          <div>
            <h1 className="text-3xl font-extrabold text-red-400">DERROTA 💀</h1>
            <p className="text-lg text-gray-300 mt-2">{boss.name} venceu desta vez...</p>
          </div>

          <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Sword size={20} className="text-red-400 mx-auto mb-1" />
                <p className="text-xl font-mono font-bold text-red-400">{totalDamage}</p>
                <p className="text-xs text-gray-400">Dano Causado</p>
              </div>
              <div className="text-center">
                <Flame size={20} className="text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-mono font-bold text-orange-400">{maxCombo}x</p>
                <p className="text-xs text-gray-400">Combo Máximo</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 pt-2 border-t border-white/10">
              Fases completadas: {phasesCompleted}/{boss.phases.length}
            </p>
            <p className="text-xs text-gray-500">
              Estude mais e tente novamente! Você receberá uma pequena recompensa de consolação.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleBattleEnd}
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Voltar ao Mapa
            </Button>
            <Button
              onClick={() => {
                setPhase(0);
                setQuestionIdx(0);
                setBossHp(boss.hp);
                setPlayerHp(boss.playerHp);
                setCombo(0);
                setMaxCombo(0);
                setTotalDamage(0);
                setSelectedAnswer(null);
                setShowFeedback(false);
                setTimeLeft(30);
                setTimerActive(true);
                setBattleState("fighting");
                setPhasesCompleted(0);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <RotateCcw size={16} className="mr-2" /> Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // BATTLE SCREEN
  // ═══════════════════════════════════════
  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1040] to-[#0a0e27] text-white flex flex-col ${shakeScreen ? "animate-shake" : ""}`}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes damageFlash { 0%{opacity:0} 50%{opacity:0.3} 100%{opacity:0} }
        .damage-flash { animation: damageFlash 0.4s ease-out; }
      `}</style>

      {flashDamage && (
        <div className="fixed inset-0 bg-red-500 damage-flash pointer-events-none z-50" />
      )}

      {/* Top Bar */}
      <div className="bg-[#0a0e27]/95 backdrop-blur-md border-b border-red-500/20 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft size={18} className="mr-1" /> Fugir
            </Button>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: boss.color }}>
                Fase {phase + 1}: {currentPhase?.name}
              </p>
              <p className="text-sm font-bold">{boss.name}</p>
            </div>
            <div className={`
              flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono font-bold text-sm
              ${timeLeft <= 10 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10 text-white"}
            `}>
              <Timer size={14} />
              {timeLeft}s
            </div>
          </div>

          {/* Boss HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                {boss.imageUrl ? (
                  <img src={boss.imageUrl} alt={boss.name} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-2xl">{boss.emoji}</span>
                )}
                <span className="font-bold" style={{ color: boss.color }}>{boss.name}</span>
              </span>
              <span className="font-mono text-gray-400">{bossHp}/{boss.hp} HP</span>
            </div>
            <div className="w-full h-4 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${bossHpPercent}%`,
                  backgroundColor: bossHpPercent > 50 ? boss.color : bossHpPercent > 25 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>

          {/* Player HP Bar */}
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-emerald-400" />
                <span className="font-bold text-emerald-400">Jogador</span>
              </span>
              <span className="font-mono text-gray-400">{playerHp}/{boss.playerHp} HP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${playerHpPercent}%`,
                  backgroundColor: playerHpPercent > 50 ? "#10b981" : playerHpPercent > 25 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>

          {combo > 0 && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm font-bold">
                <Flame size={14} /> COMBO x{combo}!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-lg font-medium text-center leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>

          {!showFeedback ? (
            <div className="space-y-3">
              {currentQuestion?.alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleAnswer(alt.id)}
                  className="w-full p-4 rounded-xl border text-left transition-all bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm uppercase">
                      {alt.id}
                    </span>
                    <span className="text-sm">{alt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`
                p-5 rounded-2xl border text-center
                ${isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
                }
              `}>
                {isCorrect ? (
                  <>
                    <div className="text-4xl mb-2">⚔️</div>
                    <h3 className="text-xl font-bold text-emerald-400">Ataque Certeiro!</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Dano causado ao boss!
                      {combo > 1 && <span className="text-orange-400 font-bold"> (Combo x{combo}!)</span>}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">💥</div>
                    <h3 className="text-xl font-bold text-red-400">O Boss contra-atacou!</h3>
                    <p className="text-sm text-gray-300 mt-1">-20 HP</p>
                  </>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-300">
                  <span className="text-yellow-400 font-bold">💡 Explicação:</span> {currentQuestion?.explanation}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-emerald-400 mt-2">
                    ✅ Resposta correta: <strong>
                      {currentQuestion?.alternatives.find(a => a.id === currentQuestion.correctAnswer)?.text}
                    </strong>
                  </p>
                )}
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-bold"
              >
                {bossHp <= 0 ? (
                  <><Trophy size={16} className="mr-2" /> Vitória!</>
                ) : (
                  <><ChevronRight size={16} className="mr-2" /> Próximo Ataque</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { BOSSES };
export type { BossData };
