/**
 * Landing Page — Conexão em Farmacologia
 * Auto-play intro video (muted, background music only), login section at bottom
 * Orange (#F7941D) + Gray (#4A4A4A) + White palette
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FlaskConical, Users, Trophy, Zap, BookOpen, Youtube,
  ChevronDown, GraduationCap, Brain, Pill, Activity,
  Target, Sparkles, ArrowRight, LogIn,
  Shield, Lock, AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useStudentAuth } from "./StudentLogin";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/TYglakFwBNwpBXzT.png";
const INTRO_VIDEO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028318382/UIYIWhxAlKmjxHUH.mp4";
const YOUTUBE_URL = "https://www.youtube.com/@Conex%C3%A3oemCi%C3%AAncia-Farmacol%C3%B3gica";

// Floating particles for background
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.id % 3 === 0 ? "#F7941D" : p.id % 3 === 1 ? "#999" : "#4A4A4A",
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// DNA Helix decoration
function DNAHelix({ side }: { side: "left" | "right" }) {
  const dots = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className={`absolute ${side === "left" ? "left-4 sm:left-8" : "right-4 sm:right-8"} top-1/4 bottom-1/4 hidden lg:flex flex-col justify-between`}>
      {dots.map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-1"
          initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? "#F7941D" : "#999",
              marginLeft: side === "left" ? `${Math.sin(i * 0.8) * 15 + 15}px` : undefined,
              marginRight: side === "right" ? `${Math.sin(i * 0.8) * 15 + 15}px` : undefined,
            }}
          />
          <div className="w-8 h-px" style={{ backgroundColor: i % 2 === 0 ? "#F7941D33" : "#99999933" }} />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: i % 2 === 0 ? "#999" : "#F7941D" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Stats counter animation
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showIntro, setShowIntro] = useState(true);
  const [introEnded, setIntroEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isStudentAuth, student: studentData } = useStudentAuth();
  const { data: leaderboard } = trpc.leaderboard.getData.useQuery();
  const totalStudents = leaderboard?.teams?.reduce((s: number, t: any) => s + t.members.length, 0) ?? 0;
  const totalTeams = leaderboard?.teams?.length ?? 0;
  const maxPF = 45;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Check if intro was already shown this session
  useEffect(() => {
    const shown = sessionStorage.getItem("intro_shown");
    if (shown) {
      setShowIntro(false);
      setIntroEnded(true);
    }
  }, []);

  // Auto-play video muted on mount (no click needed)
  useEffect(() => {
    if (showIntro && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // If auto-play fails, skip intro
        handleIntroEnd();
      });
    }
  }, [showIntro]);

  const handleIntroEnd = () => {
    sessionStorage.setItem("intro_shown", "true");
    setIntroEnded(true);
    setTimeout(() => setShowIntro(false), 800);
  };

  const skipIntro = () => {
    sessionStorage.setItem("intro_shown", "true");
    setIntroEnded(true);
    setTimeout(() => setShowIntro(false), 400);
  };

  const features = [
    {
      icon: <Trophy size={28} />,
      title: "Gamificação com PF",
      desc: "Pontos Farmacológicos (PF) substituem notas tradicionais. Cada atividade rende PF para você e sua equipe.",
      color: "#F7941D",
    },
    {
      icon: <Users size={28} />,
      title: "Equipes Farmacológicas",
      desc: "Equipes nomeadas com fármacos reais: Acetilcolina, Atropina, Adrenalina e mais. Competição saudável!",
      color: "#4A4A4A",
    },
    {
      icon: <BookOpen size={28} />,
      title: "Casos Clínicos Reais",
      desc: "Casos clínicos integrados com Semiologia, Patologia e Microbiologia. Aprendizado contextualizado.",
      color: "#F7941D",
    },
    {
      icon: <Brain size={28} />,
      title: "Metodologias Ativas",
      desc: "TBL, PBL, Jigsaw, Escape Room e BYOD. Aulas dinâmicas que transformam o aprendizado.",
      color: "#4A4A4A",
    },
    {
      icon: <Target size={28} />,
      title: "Ranking em Tempo Real",
      desc: "Acompanhe a posição da sua equipe e seu desempenho individual no leaderboard online.",
      color: "#F7941D",
    },
    {
      icon: <Youtube size={28} />,
      title: "Canal no YouTube",
      desc: "Videoaulas, discussões de casos e conteúdo complementar no canal Conexão em Ciência — Farmacológicas.",
      color: "#4A4A4A",
    },
  ];

  const timeline = [
    { week: "Semana 1", title: "Introdução à Farmacologia & Formação de Equipes", detail: "Apresentação da disciplina, regras de gamificação, formação das equipes e TBL diagnóstico.", icon: <GraduationCap size={18} /> },
    { week: "Semana 2", title: "Farmacocinética I — Absorção e Distribuição", detail: "Vias de administração, biodisponibilidade, volume de distribuição. TBL 1.", icon: <Pill size={18} /> },
    { week: "Semana 3", title: "Farmacocinética II — Metabolismo e Excreção", detail: "Biotransformação hepática, citocromo P450, depuração renal. Caso Clínico 1.", icon: <Pill size={18} /> },
    { week: "Semana 4", title: "Farmacodinâmica — Receptores e Mecanismos", detail: "Agonistas, antagonistas, dose-resposta, potência e eficácia. TBL 2.", icon: <Brain size={18} /> },
    { week: "Semana 5", title: "SNA — Transmissão Colinérgica", detail: "Agonistas e antagonistas muscarínicos, inibidores da colinesterase. Caso Clínico 2.", icon: <Activity size={18} /> },
    { week: "Semana 6", title: "SNA — Bloqueadores Neuromusculares", detail: "Despolarizantes e não-despolarizantes, uso clínico em anestesia. Seminário Jigsaw 1.", icon: <Activity size={18} /> },
    { week: "Semana 7", title: "Seminários Jigsaw 2 e 3", detail: "Apresentações dos grupos especialistas. Revisão integrativa pré-P1.", icon: <Target size={18} /> },
    { week: "Semana 8", title: "Prova P1 + Escape Room Farmacológico", detail: "Avaliação individual (P1): conteúdo até colinérgicos/BNM + 3 primeiros Jigsaw. Escape Room temático.", icon: <Zap size={18} />, highlight: true },
    { week: "Semana 9", title: "SNA — Transmissão Adrenérgica", detail: "Agonistas alfa e beta-adrenérgicos, catecolaminas. TBL 3.", icon: <FlaskConical size={18} /> },
    { week: "Semana 10", title: "SNA — Anti-adrenérgicos", detail: "Bloqueadores alfa e beta, uso clínico em hipertensão e ICC. Caso Clínico 3.", icon: <FlaskConical size={18} /> },
    { week: "Semana 11", title: "Seminários Jigsaw 4 e 5", detail: "Apresentações dos grupos especialistas sobre SNA adrenérgico.", icon: <Target size={18} /> },
    { week: "Semana 12", title: "Anti-inflamatórios Não Esteroidais (AINEs)", detail: "Inibidores de COX, seletividade, efeitos adversos. TBL 4.", icon: <Brain size={18} /> },
    { week: "Semana 13", title: "Corticosteroides & Analgésicos Opioides", detail: "Mecanismo anti-inflamatório, receptores opioides, escala analgésica. Caso Clínico 4.", icon: <Brain size={18} /> },
    { week: "Semana 14", title: "Anestésicos Locais", detail: "Mecanismo de ação, classificação, uso clínico. Seminário Jigsaw 6.", icon: <Pill size={18} /> },
    { week: "Semana 15", title: "Anti-histamínicos", detail: "Receptores H1 e H2, anti-histamínicos de 1ª e 2ª geração, uso clínico em alergias.", icon: <Pill size={18} /> },
    { week: "Semana 16", title: "Seminários Jigsaw 7 e 8 (2º dia)", detail: "Segundo dia de apresentações dos seminários Jigsaw. Revisão integrativa.", icon: <Target size={18} /> },
    { week: "Semana 17", title: "Prova P2", detail: "Avaliação individual (P2): conteúdo de adrenérgicos até anti-histamínicos.", icon: <Zap size={18} />, highlight: true },
    { week: "Semana 18", title: "Prova de Segunda Chamada", detail: "Prova substitutiva para alunos que perderam P1 ou P2 com justificativa.", icon: <Zap size={18} /> },
    { week: "Semana 19", title: "Prova Final + Premiação", detail: "Prova final para alunos em recuperação. Cerimônia de premiação das equipes campeãs.", icon: <Trophy size={18} />, highlight: true },
  ];

  // Feriados que caem em terça-feira no 1º semestre 2026
  const holidays = [
    { date: "17/02/2026", name: "Carnaval", note: "Terça-feira de Carnaval — Ponto facultativo. Não haverá aula." },
    { date: "21/04/2026", name: "Tiradentes", note: "Feriado Nacional — Dia de Tiradentes. Não haverá aula." },
  ];

  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      {/* ═══════ INTRO VIDEO OVERLAY (auto-play, muted) ═══════ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "#000" }}
            initial={{ opacity: 1 }}
            animate={{ opacity: introEnded ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <video
              ref={videoRef}
              src={INTRO_VIDEO_URL}
              playsInline
              muted
              autoPlay
              preload="auto"
              className="w-full h-full object-contain absolute inset-0"
              onEnded={handleIntroEnd}
            />
            <button
              onClick={skipIntro}
              className="absolute bottom-8 right-8 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 z-10"
              style={{
                backgroundColor: "rgba(247,148,29,0.9)",
                color: "#fff",
              }}
            >
              Pular Intro →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ HERO SECTION ═══════ */}
      <motion.div
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, rgba(247,148,29,0.08) 0%, rgba(10,22,40,0) 70%)"
        }} />
        <FloatingParticles />
        <DNAHelix side="left" />
        <DNAHelix side="right" />

        <motion.div
          className="relative z-10 flex flex-col items-center px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.img
            src={LOGO_URL}
            alt="Conexão em Farmacologia"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain drop-shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
          />

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ color: "#F7941D" }}>Conexão</span>
              <span className="text-white/60 text-2xl sm:text-3xl md:text-4xl mx-2">em</span>
              <span className="text-white">Farmacologia</span>
            </h1>
            <motion.p
              className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: "rgba(255,255,255,0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              Farmacologia I — UNIRIO — Semestre 2026.1
            </motion.p>
            <motion.p
              className="mt-2 text-sm sm:text-base max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              Uma experiência gamificada de aprendizado com metodologias ativas
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={28} style={{ color: "rgba(247,148,29,0.5)" }} />
        </motion.div>
      </motion.div>

      {/* ═══════ STATS SECTION ═══════ */}
      <div className="relative py-16 sm:py-20" style={{ backgroundColor: "#0D1B2A" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: totalStudents || 84, suffix: "", label: "Alunos", icon: <Users size={24} /> },
              { value: totalTeams || 16, suffix: "", label: "Equipes", icon: <Trophy size={24} /> },
              { value: 14, suffix: "", label: "Casos Clínicos", icon: <BookOpen size={24} /> },
              { value: maxPF, suffix: " PF", label: "Máximo por Aluno", icon: <Zap size={24} /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="flex justify-center mb-3" style={{ color: "#F7941D" }}>{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ FEATURES SECTION ═══════ */}
      <div className="relative py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Como Funciona?
            </h2>
            <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
              Uma metodologia inovadora que transforma o aprendizado de Farmacologia
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{
                  borderColor: feat.color + "44",
                  boxShadow: `0 0 30px ${feat.color}11`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: feat.color + "15", color: feat.color === "#4A4A4A" ? "#ccc" : feat.color }}
                >
                  {feat.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ TIMELINE SECTION ═══════ */}
      <div className="relative py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: "#0D1B2A" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Jornada do Semestre
            </h2>
            <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
              19 semanas de aprendizado intensivo e gamificado
            </p>
          </motion.div>

          {/* Feriados Alert */}
          <motion.div
            className="mb-8 p-4 rounded-xl border"
            style={{ backgroundColor: "rgba(247,148,29,0.06)", borderColor: "rgba(247,148,29,0.2)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: "#F7941D" }} />
              <span className="text-sm font-bold" style={{ color: "#F7941D" }}>
                Feriados em Terça-feira — 1º Semestre 2026
              </span>
            </div>
            <div className="space-y-2">
              {holidays.map((h) => (
                <div key={h.date} className="flex items-start gap-3 text-sm">
                  <span className="font-mono font-semibold shrink-0" style={{ color: "#F7941D" }}>{h.date}</span>
                  <div>
                    <span className="font-semibold text-white">{h.name}</span>
                    <span className="ml-2" style={{ color: "rgba(255,255,255,0.5)" }}>— {h.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px" style={{ backgroundColor: "rgba(247,148,29,0.2)" }} />
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.week}
                  className="relative flex items-start gap-4 sm:gap-6 pl-2 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                >
                  <div
                    className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: (item as any).highlight || expandedWeek === i ? "#F7941D" : "rgba(247,148,29,0.15)",
                      color: (item as any).highlight || expandedWeek === i ? "#fff" : "#F7941D",
                      border: `2px solid ${(item as any).highlight || expandedWeek === i ? "#F7941D" : "rgba(247,148,29,0.3)"}`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <span className="text-xs font-mono font-bold" style={{ color: "#F7941D" }}>{item.week}</span>
                    <h3 className="text-base sm:text-lg font-semibold text-white mt-0.5">{item.title}</h3>
                    <AnimatePresence>
                      {expandedWeek === i && (
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
                        transform: expandedWeek === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ CTA + LOGIN SECTION ═══════ */}
      <div className="relative py-16 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={40} className="mx-auto mb-6" style={{ color: "#F7941D" }} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Pronto para a Jornada?
            </h2>
            <p className="text-base sm:text-lg mb-4 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Acesse o leaderboard, acompanhe sua equipe e conquiste seus Pontos Farmacológicos!
            </p>
          </motion.div>

          {/* Login Cards */}
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Student Login Card */}
            <motion.div
              className="relative p-8 rounded-2xl border overflow-hidden group"
              style={{
                backgroundColor: "rgba(247,148,29,0.04)",
                borderColor: "rgba(247,148,29,0.2)",
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ borderColor: "#F7941D", boxShadow: "0 0 40px rgba(247,148,29,0.15)" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10" style={{ backgroundColor: "#F7941D" }} />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(247,148,29,0.15)" }}>
                  <GraduationCap size={32} style={{ color: "#F7941D" }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Área do Aluno
                </h3>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Acesse o leaderboard, acompanhe seus Pontos Farmacológicos, veja o ranking da sua equipe e confira os avisos.
                </p>
                <div className="space-y-3">
                  {isStudentAuth ? (
                    <button
                      onClick={() => setLocation("/leaderboard")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: "#F7941D", color: "#fff" }}
                    >
                      <Trophy size={18} />
                      Acessar Plataforma
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setLocation("/login-aluno")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: "#F7941D", color: "#fff" }}
                    >
                      <LogIn size={18} />
                      Fazer Login / Cadastrar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Professor Card */}
            <motion.div
              className="relative p-8 rounded-2xl border overflow-hidden group"
              style={{
                backgroundColor: "rgba(74,74,74,0.08)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ borderColor: "rgba(255,255,255,0.3)", boxShadow: "0 0 40px rgba(255,255,255,0.05)" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5" style={{ backgroundColor: "#fff" }} />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <Shield size={32} style={{ color: "#ccc" }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Área do Professor
                </h3>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Gerencie equipes, atualize PF dos alunos, publique avisos, controle atividades e configure o sistema.
                </p>
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <button
                      onClick={() => setLocation("/admin")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <Lock size={18} />
                      Painel Administrativo
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <a
                      href={getLoginUrl()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <LogIn size={18} />
                      Fazer Login
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* YouTube CTA */}
          <div className="flex justify-center mt-8">
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 border"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Youtube size={20} />
              Canal no YouTube
            </a>
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0D1B2A" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-sm font-semibold text-white/70">Conexão em Farmacologia</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span>UNIRIO — Farmacologia I — 2026.1</span>
            <span>•</span>
            <span>Prof. Pedro Braga</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
