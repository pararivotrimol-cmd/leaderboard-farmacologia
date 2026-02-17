/**
 * Reuniões Online — Monitorias e sessões de dúvidas
 * Students can see upcoming meetings scheduled by monitors and join via link
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock, ExternalLink, Clock, Monitor, ArrowLeft,
  FlaskConical, Search, Video, Users, Filter, Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const PLATFORM_INFO: Record<string, { label: string; icon: string; color: string }> = {
  google_meet: { label: "Google Meet", icon: "📹", color: "#34a853" },
  zoom: { label: "Zoom", icon: "💻", color: "#2d8cff" },
  teams: { label: "Teams", icon: "💬", color: "#6264a7" },
  discord: { label: "Discord", icon: "🎮", color: "#5865f2" },
  other: { label: "Outro", icon: "🔗", color: "#F7941D" },
};

export default function Reunioes() {
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("Todos");

  const { data: meetings, isLoading } = trpc.meetings.getVisible.useQuery();

  // Separate upcoming from past
  const { upcoming, past, modules } = useMemo(() => {
    if (!meetings) return { upcoming: [], past: [], modules: ["Todos"] };
    const now = new Date();
    const upcomingList: typeof meetings = [];
    const pastList: typeof meetings = [];
    const moduleSet = new Set<string>();

    for (const m of meetings) {
      moduleSet.add(m.module);
      const endTime = new Date(new Date(m.scheduledAt).getTime() + m.durationMinutes * 60000);
      if (endTime >= now && m.status !== "completed" && m.status !== "cancelled") {
        upcomingList.push(m);
      } else {
        pastList.push(m);
      }
    }

    return {
      upcoming: upcomingList,
      past: pastList,
      modules: ["Todos", ...Array.from(moduleSet)],
    };
  }, [meetings]);

  // Filter
  const filteredUpcoming = useMemo(() => {
    return upcoming.filter(m => {
      const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.monitorName.toLowerCase().includes(search.toLowerCase()) ||
        m.module.toLowerCase().includes(search.toLowerCase());
      const matchModule = filterModule === "Todos" || m.module === filterModule;
      return matchSearch && matchModule;
    });
  }, [upcoming, search, filterModule]);

  const filteredPast = useMemo(() => {
    return past.filter(m => {
      const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.monitorName.toLowerCase().includes(search.toLowerCase());
      const matchModule = filterModule === "Todos" || m.module === filterModule;
      return matchSearch && matchModule;
    });
  }, [past, search, filterModule]);

  function formatDate(d: string | Date) {
    return new Date(d).toLocaleDateString("pt-BR", {
      weekday: "long", day: "2-digit", month: "long",
      timeZone: "America/Sao_Paulo",
    });
  }

  function formatTime(d: string | Date) {
    return new Date(d).toLocaleTimeString("pt-BR", {
      hour: "2-digit", minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  }

  function isLive(m: any) {
    if (m.status === "live") return true;
    const now = new Date();
    const start = new Date(m.scheduledAt);
    const end = new Date(start.getTime() + m.durationMinutes * 60000);
    return now >= start && now <= end;
  }

  function timeUntil(d: string | Date) {
    const now = new Date();
    const target = new Date(d);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "Agora";
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `em ${days} dia${days > 1 ? "s" : ""}`;
    }
    if (hours > 0) return `em ${hours}h${minutes > 0 ? `${minutes}min` : ""}`;
    return `em ${minutes}min`;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container py-6">
          <div className="flex items-center gap-2 mb-1">
            <a href="/leaderboard" className="text-muted-foreground hover:text-primary">
              <ArrowLeft size={16} />
            </a>
            <FlaskConical size={16} className="text-primary" />
            <span className="text-xs font-medium text-primary tracking-wide uppercase font-display">
              Conexão em Farmacologia
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground flex items-center gap-3">
            <Video size={28} className="text-primary" />
            Monitorias Online
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sessões de dúvidas com os monitores — entre na sala e tire suas dúvidas!
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="container py-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar monitoria, monitor ou tema..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-secondary text-foreground text-sm border border-border focus:border-primary outline-none"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={filterModule}
              onChange={e => setFilterModule(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-lg bg-secondary text-foreground text-sm border border-border focus:border-primary outline-none appearance-none"
            >
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Carregando monitorias...</p>
          </div>
        ) : !meetings?.length ? (
          <div className="text-center py-16">
            <CalendarClock size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">Nenhuma monitoria agendada</h3>
            <p className="text-sm text-muted-foreground">Os monitores ainda não agendaram sessões de dúvidas.</p>
          </div>
        ) : (
          <>
            {/* Upcoming Meetings */}
            {filteredUpcoming.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-primary" />
                  Próximas Monitorias
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                    {filteredUpcoming.length}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredUpcoming.map((m, idx) => {
                    const pInfo = PLATFORM_INFO[m.platform] || PLATFORM_INFO.other;
                    const live = isLive(m);
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border rounded-lg overflow-hidden ${live ? "border-green-500/50 shadow-lg shadow-green-500/10" : "border-border"}`}
                        style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                      >
                        {/* Status bar */}
                        <div className={`px-4 py-2 flex items-center justify-between ${live ? "bg-green-500/10" : "bg-primary/5"}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{pInfo.icon}</span>
                            <span className="text-xs font-medium" style={{ color: pInfo.color }}>{pInfo.label}</span>
                          </div>
                          {live ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              AO VIVO
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">
                              {timeUntil(m.scheduledAt)}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-display font-semibold text-foreground mb-1">{m.title}</h3>
                          {m.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{m.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Monitor size={12} className="text-primary" /> {m.monitorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarClock size={12} /> {formatDate(m.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {formatTime(m.scheduledAt)} • {m.durationMinutes}min
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {m.module}
                            </span>
                            {m.recurrence === "weekly" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                                🔁 Semanal
                              </span>
                            )}
                          </div>

                          <a
                            href={m.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                              live
                                ? "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            }`}
                          >
                            <ExternalLink size={16} />
                            {live ? "Entrar Agora" : "Acessar Reunião"}
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Meetings */}
            {filteredPast.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2 text-muted-foreground">
                  <Clock size={18} />
                  Monitorias Anteriores
                </h2>
                <div className="space-y-2">
                  {filteredPast.slice(0, 10).map((m) => {
                    const pInfo = PLATFORM_INFO[m.platform] || PLATFORM_INFO.other;
                    return (
                      <div
                        key={m.id}
                        className="border border-border rounded-lg p-3 flex items-center gap-3 opacity-60"
                        style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                      >
                        <span className="text-lg">{pInfo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground font-medium truncate block">{m.title}</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{m.monitorName}</span>
                            <span>•</span>
                            <span>{formatDate(m.scheduledAt)}</span>
                            <span>•</span>
                            <span>{m.module}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 font-medium shrink-0">
                          Encerrada
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredUpcoming.length === 0 && filteredPast.length === 0 && (
              <div className="text-center py-12">
                <Search size={40} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">Nenhuma monitoria encontrada com esses filtros.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
