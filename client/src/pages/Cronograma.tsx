/**
 * Cronograma — Jornada do Semestre
 * Página separada acessível por alunos, professores e admin
 * Contém timeline semanal, feriados e detalhes de cada semana
 * Dados carregados do banco de dados (editável pelo professor/admin)
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Users, Trophy, Zap, BookOpen,
  ChevronDown, GraduationCap, Brain, Pill, Activity,
  Target, AlertTriangle, ArrowLeft, Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const ORANGE = "#F7941D";

// Static fallback data (used if DB is empty or loading fails)
const staticTimeline = [
  { weekLabel: "Semana 1", weekDate: "10/03/2026", title: "Introdução à Farmacologia & Farmacocinética 1", detail: "Apresentação da disciplina, regras de gamificação, formação das equipes. Absorção e Distribuição — vias de administração, biodisponibilidade, volume de distribuição.", type: "aula", highlight: false },
  { weekLabel: "Semana 2", weekDate: "17/03/2026", title: "Farmacocinética 2 — Metabolismo e Excreção", detail: "Biotransformação hepática, citocromo P450, depuração renal. TBL 1.", type: "tbl", highlight: false },
  { weekLabel: "Semana 3", weekDate: "24/03/2026", title: "Farmacodinâmica — Receptores e Mecanismos", detail: "Agonistas, antagonistas, dose-resposta, potência e eficácia. Caso Clínico 1.", type: "caso", highlight: false },
  { weekLabel: "Semana 4", weekDate: "31/03/2026", title: "Boas Práticas de Prescrição", detail: "Prescrição racional, farmacovigilância, interações medicamentosas. TBL 2.", type: "tbl", highlight: false },
  { weekLabel: "Semana 5", weekDate: "07/04/2026", title: "SNA — Transmissão Colinérgica", detail: "Agonistas e antagonistas muscarínicos, inibidores da colinesterase. Caso Clínico 2.", type: "caso", highlight: false },
  { weekLabel: "Semana 6", weekDate: "14/04/2026", title: "Bloqueadores Colinérgicos e Neuromusculares", detail: "Despolarizantes e não-despolarizantes, uso clínico em anestesia. Seminário Jigsaw 1.", type: "jigsaw", highlight: false },
  { weekLabel: "Semana 7", weekDate: "28/04/2026", title: "Primeiro Dia de Seminários Jigsaw", detail: "Apresentações dos grupos especialistas. Revisão integrativa pré-P1.", type: "jigsaw", highlight: false },
  { weekLabel: "Semana 8", weekDate: "05/05/2026", title: "Prova P1 + Escape Room Farmacológico", detail: "Avaliação individual (P1): conteúdo até colinérgicos/BNM + 3 primeiros Jigsaw. Escape Room temático.", type: "prova", highlight: true },
  { weekLabel: "Semana 9", weekDate: "12/05/2026", title: "SNA — Transmissão Adrenérgica", detail: "Agonistas alfa e beta-adrenérgicos, catecolaminas. TBL 3.", type: "tbl", highlight: false },
  { weekLabel: "Semana 10", weekDate: "19/05/2026", title: "SNA — Anti-adrenérgicos", detail: "Bloqueadores alfa e beta, uso clínico em hipertensão e ICC. Caso Clínico 3.", type: "caso", highlight: false },
  { weekLabel: "Semana 11", weekDate: "26/05/2026", title: "AINEs e Corticoides", detail: "Anti-inflamatórios Não Esteroidais (inibidores de COX), corticosteroides, mecanismo anti-inflamatório, efeitos adversos. TBL 4.", type: "tbl", highlight: false },
  { weekLabel: "Semana 12", weekDate: "02/06/2026", title: "Anestésicos Locais", detail: "Mecanismo de ação, classificação, uso clínico. Bloqueio nervoso, aplicações em odontologia e cirurgia.", type: "aula", highlight: false },
  { weekLabel: "Semana 13", weekDate: "09/06/2026", title: "Anti-histamínicos", detail: "Receptores H1 e H2, anti-histamínicos de 1ª e 2ª geração, uso clínico em alergias e gastrite. Caso Clínico 4.", type: "caso", highlight: false },
  { weekLabel: "Semana 14", weekDate: "16/06/2026", title: "Seminários Jigsaw 2", detail: "Segundo dia de apresentações dos seminários Jigsaw. Revisão integrativa dos temas anteriores.", type: "jigsaw", highlight: false },
  { weekLabel: "Semana 15", weekDate: "23/06/2026", title: "P2 — Prova Individual", detail: "Avaliação individual (P2): conteúdo de adrenérgicos até anti-histamínicos. Avaliação de aprendizado.", type: "prova", highlight: true },
  { weekLabel: "Semana 16", weekDate: "30/06/2026", title: "Segunda Chamada", detail: "Oportunidade para alunos que faltaram na P1 ou P2 realizarem a avaliação. Revisão de conteúdo.", type: "aula", highlight: false },
  { weekLabel: "Semana 17", weekDate: "07/07/2026", title: "Prova Final + Premiação", detail: "Prova final integrativa (PF): conteúdo completo do semestre. Cerimônia de premiação das equipes campeãs.", type: "prova", highlight: true },
];

const holidays = [
  { date: "17/02/2026", name: "Carnaval", note: "Terça-feira de Carnaval — Ponto facultativo. Não haverá aula." },
  { date: "21/04/2026", name: "Tiradentes", note: "Feriado Nacional — Dia de Tiradentes. Não haverá aula." },
];

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  aula: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.6)", label: "Aula" },
  tbl: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", label: "TBL" },
  caso: { bg: "rgba(16,185,129,0.15)", text: "#34d399", label: "Caso Clínico" },
  jigsaw: { bg: "rgba(168,85,247,0.15)", text: "#c084fc", label: "Jigsaw" },
  prova: { bg: "rgba(247,148,29,0.15)", text: "#F7941D", label: "Prova" },
};

const typeIcons: Record<string, React.ReactElement> = {
  aula: <GraduationCap size={18} />,
  tbl: <Brain size={18} />,
  caso: <Activity size={18} />,
  jigsaw: <Target size={18} />,
  prova: <Zap size={18} />,
};

export default function Cronograma() {
  const [, setLocation] = useLocation();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Fetch schedule from database
  const { data: dbEntries, isLoading } = trpc.schedule.getAll.useQuery(undefined, {
    retry: 1,
    staleTime: 60_000,
  });

  // Use DB data if available, otherwise fall back to static data
  const timeline = (dbEntries && dbEntries.length > 0) ? dbEntries.map(e => ({
    weekLabel: e.weekLabel,
    weekDate: e.weekDate ?? undefined,
    title: e.title,
    detail: e.detail ?? undefined,
    type: e.type,
    highlight: e.highlight,
  })) : staticTimeline;

  const filteredTimeline = filter === "all"
    ? timeline
    : timeline.filter(item => item.type === filter);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: "rgba(10,22,40,0.95)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Calendar size={22} style={{ color: ORANGE }} />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Jornada do Semestre
              </h1>
              <p className="text-xs" style={{ color: "rgba(247,148,29,0.8)" }}>
                Medicina — Farmacologia 1 — 2026.1
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Subtitle */}
        <motion.p
          className="text-base mb-8"
          style={{ color: "rgba(255,255,255,0.5)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {timeline.length} semanas de aprendizado intensivo e gamificado
          {isLoading && <span className="ml-2 text-xs opacity-50">(carregando...)</span>}
        </motion.p>

        {/* Filter tabs */}
        <motion.div
          className="flex gap-2 flex-wrap mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { key: "all", label: "Todas" },
            { key: "aula", label: "Aulas" },
            { key: "tbl", label: "TBL" },
            { key: "caso", label: "Casos Clínicos" },
            { key: "jigsaw", label: "Jigsaw" },
            { key: "prova", label: "Provas" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === f.key ? ORANGE : "rgba(255,255,255,0.06)",
                color: filter === f.key ? "#fff" : "rgba(255,255,255,0.5)",
                border: `1px solid ${filter === f.key ? ORANGE : "rgba(255,255,255,0.1)"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Feriados Alert */}
        <motion.div
          className="mb-8 p-4 rounded-xl border"
          style={{ backgroundColor: "rgba(247,148,29,0.06)", borderColor: "rgba(247,148,29,0.2)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} style={{ color: ORANGE }} />
            <span className="text-sm font-bold" style={{ color: ORANGE }}>
              Feriados em Terça-feira — 1º Semestre 2026
            </span>
          </div>
          <div className="space-y-2">
            {holidays.map((h) => (
              <div key={h.date} className="flex items-start gap-3 text-sm">
                <span className="font-mono font-semibold shrink-0" style={{ color: ORANGE }}>{h.date}</span>
                <div>
                  <span className="font-semibold text-white">{h.name}</span>
                  <span className="ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>— {h.note}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px" style={{ backgroundColor: "rgba(247,148,29,0.2)" }} />
          <div className="space-y-4">
            {filteredTimeline.map((item, i) => {
              const typeInfo = typeColors[item.type] || typeColors.aula;
              const icon = typeIcons[item.type] || <GraduationCap size={18} />;
              const originalIndex = timeline.indexOf(item);
              return (
                <motion.div
                  key={`${item.weekLabel}-${i}`}
                  className="relative flex items-start gap-4 sm:gap-6 pl-2 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => setExpandedWeek(expandedWeek === originalIndex ? null : originalIndex)}
                >
                  <div
                    className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: item.highlight || expandedWeek === originalIndex ? ORANGE : "rgba(247,148,29,0.15)",
                      color: item.highlight || expandedWeek === originalIndex ? "#fff" : ORANGE,
                      border: `2px solid ${item.highlight || expandedWeek === originalIndex ? ORANGE : "rgba(247,148,29,0.3)"}`,
                    }}
                  >
                    {icon}
                  </div>

                  <div className="pt-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold" style={{ color: ORANGE }}>{item.weekLabel}</span>
                      {item.weekDate && (
                        <span className="text-xs font-mono" style={{ color: "rgba(247,148,29,0.5)" }}>{item.weekDate}</span>
                      )}
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: typeInfo.bg, color: typeInfo.text }}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mt-0.5">{item.title}</h3>
                    <AnimatePresence>
                      {expandedWeek === originalIndex && item.detail && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm mt-1.5 leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                          {item.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-3 shrink-0">
                    <ChevronDown
                      size={16}
                      className="transition-transform duration-300"
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        transform: expandedWeek === originalIndex ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <motion.div
          className="mt-12 p-4 rounded-xl border"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h4 className="text-sm font-bold text-white mb-3">Legenda</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: val.text }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{val.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
