/**
 * Monitor Portal - Portal dedicado para monitores da disciplina
 * Monitores têm acesso a: Jogo, Turmas, Equipes, Frequências, Recursos, Seminários
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Gamepad2, Users, BookOpen, ClipboardList,
  FolderOpen, Presentation, LogOut, User,
  ChevronRight, Shield, Eye, EyeOff, Loader2,
  GraduationCap, BarChart3, MessageSquare
} from "lucide-react";

const MONITOR_SESSION_KEY = "monitor_session_token";

interface MonitorInfo {
  id: number;
  email: string;
  displayName: string | null;
  accountType: string;
}

// Monitor feature cards
const MONITOR_FEATURES = [
  {
    icon: <Gamepad2 size={28} />,
    label: "Jogo",
    description: "Gerenciar partidas e pontuações do Kahoot",
    href: "/jogo",
    color: "#f59e0b",
    bg: "from-amber-500/20 to-amber-600/10",
  },
  {
    icon: <Users size={28} />,
    label: "Turmas",
    description: "Visualizar e gerenciar turmas da disciplina",
    href: "/turmas",
    color: "#6366f1",
    bg: "from-indigo-500/20 to-indigo-600/10",
  },
  {
    icon: <Shield size={28} />,
    label: "Equipes",
    description: "Acompanhar equipes e distribuição de alunos",
    href: "/equipes",
    color: "#10b981",
    bg: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    icon: <ClipboardList size={28} />,
    label: "Frequências",
    description: "Controle de presença e relatórios de frequência",
    href: "/professor/relatorios-presenca",
    color: "#3b82f6",
    bg: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: <FolderOpen size={28} />,
    label: "Recursos",
    description: "Materiais de estudo, PDFs e playlists",
    href: "/materiais",
    color: "#8b5cf6",
    bg: "from-violet-500/20 to-violet-600/10",
  },
  {
    icon: <Presentation size={28} />,
    label: "Seminários",
    description: "Gerenciar grupos Jigsaw e seminários",
    href: "/seminarios",
    color: "#ec4899",
    bg: "from-pink-500/20 to-pink-600/10",
  },
  {
    icon: <BarChart3 size={28} />,
    label: "Leaderboard",
    description: "Quadro geral de pontuação da turma",
    href: "/leaderboard",
    color: "#f97316",
    bg: "from-orange-500/20 to-orange-600/10",
  },
  {
    icon: <MessageSquare size={28} />,
    label: "Chat",
    description: "Comunicação direta com alunos",
    href: "/chat",
    color: "#06b6d4",
    bg: "from-cyan-500/20 to-cyan-600/10",
  },
];

function MonitorLoginForm({ onLogin }: { onLogin: (token: string, monitor: MonitorInfo) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.monitors.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem(MONITOR_SESSION_KEY, data.sessionToken);
        onLogin(data.sessionToken, data.monitor as MonitorInfo);
        toast.success("Bem-vindo ao Portal do Monitor!");
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Erro ao fazer login"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <GraduationCap size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">Portal do Monitor</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conexão em Farmacologia I — UNIRIO
          </p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-2xl border border-border p-6"
          style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="monitor@edu.unirio.br"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Entrando...</>
              ) : (
                "Entrar no Portal"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Não tem acesso?{" "}
              <Link href="/professor/login" className="text-primary hover:underline">
                Fale com o professor
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar ao início
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function MonitorDashboard({ monitor, sessionToken, onLogout }: {
  monitor: MonitorInfo;
  sessionToken: string;
  onLogout: () => void;
}) {
  const logoutMutation = trpc.monitors.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem(MONITOR_SESSION_KEY);
      onLogout();
      toast.success("Sessão encerrada");
    },
  });

  const displayName = monitor.displayName || monitor.email.split("@")[0];
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div
        className="border-b border-border px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">Monitor · Farmacologia I</p>
          </div>
        </div>

        <button
          onClick={() => logoutMutation.mutate({ sessionToken })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground font-display">
            Olá, {displayName.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bem-vindo ao painel de monitoria da Conexão em Farmacologia I.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {MONITOR_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={feature.href}>
                <div
                  className={`rounded-xl border border-border/50 p-4 cursor-pointer bg-gradient-to-br ${feature.bg} hover:border-primary/30 transition-all`}
                  style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ color: feature.color, backgroundColor: feature.color + "22" }}
                  >
                    {feature.icon}
                  </div>
                  <p className="font-semibold text-sm text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs" style={{ color: feature.color }}>Acessar</span>
                    <ChevronRight size={12} style={{ color: feature.color }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-xl border border-primary/20 p-4 flex items-start gap-3"
          style={{ backgroundColor: "oklch(0.696 0.17 162.48 / 0.06)" }}
        >
          <User size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Acesso de Monitor</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Você tem acesso de leitura e suporte às funcionalidades da disciplina.
              Para ações administrativas, entre em contato com o professor.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MonitorPortal() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [monitor, setMonitor] = useState<MonitorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem(MONITOR_SESSION_KEY);
    if (token) {
      setSessionToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Validate session token
  const { data: monitorData, isLoading: isValidating, isError: isValidationError } = trpc.monitors.me.useQuery(
    { sessionToken: sessionToken ?? "" },
    { enabled: !!sessionToken }
  );

  // Handle validation result
  useEffect(() => {
    if (!sessionToken) return;
    if (isValidating) return;
    if (isValidationError || !monitorData) {
      localStorage.removeItem(MONITOR_SESSION_KEY);
      setSessionToken(null);
      setLoading(false);
      return;
    }
    setMonitor(monitorData as MonitorInfo);
    setLoading(false);
  }, [monitorData, isValidating, isValidationError, sessionToken]);

  const handleLogin = (token: string, monitorInfo: MonitorInfo) => {
    setSessionToken(token);
    setMonitor(monitorInfo);
  };

  const handleLogout = () => {
    setSessionToken(null);
    setMonitor(null);
  };

  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!sessionToken || !monitor) {
    return <MonitorLoginForm onLogin={handleLogin} />;
  }

  return (
    <MonitorDashboard
      monitor={monitor}
      sessionToken={sessionToken}
      onLogout={handleLogout}
    />
  );
}
