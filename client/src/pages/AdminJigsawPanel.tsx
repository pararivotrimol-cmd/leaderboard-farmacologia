/**
 * AdminJigsawPanel — Painel completo de gerenciamento do Seminário Jigsaw
 * Fase 1: Grupos Especialistas (visualização + notas)
 * Fase 2: Grupos Mosaico (geração automática)
 * Notificações: Envio em massa para todos os alunos
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, ChevronDown, ChevronUp, Save, Loader2,
  Bell, Shuffle, CheckCircle2, BookOpen, Award,
  RefreshCw, Trash2, Eye, EyeOff, Search, FlaskConical,
  Puzzle, GraduationCap, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Color palette for groups ───
const GROUP_COLORS = [
  { bg: "oklch(0.3 0.12 162)", accent: "#10b981", light: "oklch(0.696 0.17 162.48 / 0.15)" },
  { bg: "oklch(0.3 0.12 240)", accent: "#6366f1", light: "oklch(0.585 0.233 277.12 / 0.15)" },
  { bg: "oklch(0.3 0.12 30)", accent: "#f59e0b", light: "oklch(0.769 0.188 70.08 / 0.15)" },
  { bg: "oklch(0.3 0.12 300)", accent: "#ec4899", light: "oklch(0.656 0.241 354.31 / 0.15)" },
  { bg: "oklch(0.3 0.12 200)", accent: "#06b6d4", light: "oklch(0.715 0.143 215.22 / 0.15)" },
  { bg: "oklch(0.3 0.12 10)", accent: "#ef4444", light: "oklch(0.637 0.237 25.33 / 0.15)" },
];

// ─── Score input component ───
function ScoreInput({
  label, value, max, onChange, color
}: {
  label: string; value: number; max: number; onChange: (v: number) => void; color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="w-7 h-7 rounded text-xs font-mono font-bold transition-all"
            style={{
              backgroundColor: value === i ? color : "oklch(0.245 0.03 264.052)",
              color: value === i ? "#fff" : "oklch(0.7 0.02 264)",
              border: `1px solid ${value === i ? color : "oklch(0.35 0.03 264.052)"}`,
            }}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Expert Group Card ───
function ExpertGroupCard({
  group, index, onScoresSaved
}: {
  group: any; index: number; onScoresSaved: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [scores, setScores] = useState<Record<number, { presentation: number; participation: number }>>({});
  const [search, setSearch] = useState("");

  const color = GROUP_COLORS[index % GROUP_COLORS.length];
  const utils = trpc.useUtils();

  const { data: existingScores } = trpc.jigsawComplete.expertGroups.getScores.useQuery(
    { expertGroupId: group.id },
    { enabled: showScoring }
  );

  const scoreMutation = trpc.jigsawComplete.expertGroups.scorePresentation.useMutation({
    onSuccess: () => {
      toast.success(`Notas do ${group.name} salvas!`);
      utils.jigsawComplete.expertGroups.getByClass.invalidate();
      utils.jigsawComplete.expertGroups.getScores.invalidate({ expertGroupId: group.id });
      setShowScoring(false);
      setScores({});
      onScoresSaved();
    },
    onError: (e) => toast.error(e.message || "Erro ao salvar notas"),
  });

  const filteredMembers = useMemo(() =>
    (group.members || []).filter((m: any) =>
      !search || m.name?.toLowerCase().includes(search.toLowerCase())
    ), [group.members, search]
  );

  const handleSaveScores = () => {
    const scoresArray = Object.entries(scores).map(([memberId, s]) => ({
      memberId: Number(memberId),
      presentationScore: s.presentation,
      participationScore: s.participation,
    }));
    if (scoresArray.length === 0) {
      toast.error("Preencha pelo menos uma nota antes de salvar.");
      return;
    }
    scoreMutation.mutate({ expertGroupId: group.id, scores: scoresArray });
  };

  const isCompleted = group.status === "completed";
  const memberCount = group.members?.length || 0;

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden border"
      style={{
        borderColor: isCompleted ? color.accent + "60" : "oklch(0.35 0.03 264.052)",
        backgroundColor: "oklch(0.195 0.03 264.052)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        style={{ backgroundColor: isCompleted ? color.light : "transparent" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
            style={{ backgroundColor: color.accent + "22", color: color.accent }}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm">{group.name}</span>
              {isCompleted && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: color.accent + "20", color: color.accent }}>
                  ✓ Notas lançadas
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{group.topicTitle}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="font-mono font-bold text-sm" style={{ color: color.accent }}>{memberCount}</div>
              <div className="text-[10px] text-muted-foreground">alunos</div>
            </div>
            {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 pb-4 pt-3 space-y-3"
              style={{ borderColor: "oklch(0.3 0.03 264.052)" }}>

              {/* Topic info */}
              <div className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: color.light }}>
                <BookOpen size={14} style={{ color: color.accent }} className="mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold" style={{ color: color.accent }}>Tema: </span>
                  <span className="text-xs text-foreground">{group.topicTitle}</span>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-background border border-border text-foreground"
                />
              </div>

              {/* Members list */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredMembers.map((member: any, mIdx: number) => {
                  const existing = existingScores?.find((s: any) => s.memberId === member.id);
                  const current = scores[member.id];
                  const hasScore = existing?.presentationScore != null;

                  return (
                    <div key={member.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-md"
                      style={{ backgroundColor: "oklch(0.22 0.03 264.052)" }}>
                      <span className="text-[10px] text-muted-foreground font-mono w-5 text-center">{mIdx + 1}</span>
                      <span className="flex-1 text-xs text-foreground truncate">{member.name}</span>
                      {hasScore && !showScoring && (
                        <span className="text-[10px] font-mono" style={{ color: color.accent }}>
                          {Number(existing.presentationScore).toFixed(1)} + {Number(existing.participationScore).toFixed(1)}
                        </span>
                      )}
                      {showScoring && (
                        <div className="flex gap-3 items-center">
                          <ScoreInput
                            label="Apres."
                            value={current?.presentation ?? (existing ? Number(existing.presentationScore) : 0)}
                            max={5}
                            onChange={(v) => setScores(prev => ({ ...prev, [member.id]: { ...prev[member.id], presentation: v, participation: prev[member.id]?.participation ?? 0 } }))}
                            color={color.accent}
                          />
                          <ScoreInput
                            label="Part."
                            value={current?.participation ?? (existing ? Number(existing.participationScore) : 0)}
                            max={2}
                            onChange={(v) => setScores(prev => ({ ...prev, [member.id]: { ...prev[member.id], participation: v, presentation: prev[member.id]?.presentation ?? 0 } }))}
                            color={color.accent}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs gap-1.5"
                  onClick={() => setShowScoring(!showScoring)}
                >
                  {showScoring ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showScoring ? "Ocultar notas" : "Lançar notas"}
                </Button>
                {showScoring && (
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1.5"
                    style={{ backgroundColor: color.accent }}
                    onClick={handleSaveScores}
                    disabled={scoreMutation.isPending}
                  >
                    {scoreMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Salvar notas
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Home Group Card (Fase 2) ───
function HomeGroupCard({ group, index }: { group: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = GROUP_COLORS[index % GROUP_COLORS.length];

  return (
    <motion.div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "oklch(0.35 0.03 264.052)", backgroundColor: "oklch(0.195 0.03 264.052)" }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="p-3 cursor-pointer flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: color.accent + "22", color: color.accent }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{group.name}</span>
          <p className="text-xs text-muted-foreground">{group.members?.length || 0} especialistas</p>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-3 pb-3 pt-2 space-y-1.5"
              style={{ borderColor: "oklch(0.3 0.03 264.052)" }}>
              {(group.members || []).map((m: any, mIdx: number) => (
                <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded"
                  style={{ backgroundColor: "oklch(0.22 0.03 264.052)" }}>
                  <span className="text-[10px] text-muted-foreground font-mono w-4">{mIdx + 1}</span>
                  <span className="flex-1 text-xs text-foreground truncate">{m.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-white truncate max-w-[120px]"
                    style={{ backgroundColor: GROUP_COLORS[mIdx % GROUP_COLORS.length].accent + "cc" }}>
                    {m.topicName?.split(" ").slice(0, 3).join(" ")}...
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───
export default function AdminJigsawPanel() {
  const [activePhase, setActivePhase] = useState<"fase1" | "fase2">("fase1");
  const [classId] = useState(1);
  const utils = trpc.useUtils();

  // Data queries
  const { data: expertGroups = [], isLoading: loadingExpert, refetch: refetchExpert } =
    trpc.jigsawComplete.expertGroups.getByClass.useQuery({ classId });

  const { data: homeGroups = [], isLoading: loadingHome, refetch: refetchHome } =
    trpc.jigsawComplete.homeGroups.getByClass.useQuery({ classId });

  // Mutations
  const notifyMutation = trpc.jigsawComplete.notifyAllGroups.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ ${data.totalNotified} alunos notificados com sucesso!`);
    },
    onError: (e) => toast.error(e.message || "Erro ao enviar notificações"),
  });

  const generateHomeMutation = trpc.jigsawComplete.generateHomeGroups.useMutation({
    onSuccess: (data) => {
      toast.success(`🎉 ${data.totalHomeGroups} grupos mosaico criados!`);
      refetchHome();
      setActivePhase("fase2");
    },
    onError: (e) => toast.error(e.message || "Erro ao gerar grupos mosaico"),
  });

  const deleteHomeMutation = trpc.jigsawComplete.deleteHomeGroups.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.deleted} grupos mosaico removidos.`);
      refetchHome();
    },
    onError: (e) => toast.error(e.message || "Erro ao deletar grupos"),
  });

  // Stats
  const completedGroups = expertGroups.filter((g: any) => g.status === "completed").length;
  const totalMembers = expertGroups.reduce((sum: number, g: any) => sum + (g.members?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Puzzle size={20} className="text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Seminário Jigsaw</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerencie os grupos especialistas (Fase 1), grupos mosaico (Fase 2) e envie notificações aos alunos.
          </p>
        </div>

        {/* Notify button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => notifyMutation.mutate({ classId })}
          disabled={notifyMutation.isPending || expertGroups.length === 0}
        >
          {notifyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
          Notificar alunos
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Users size={16} />, label: "Grupos Especialistas", value: expertGroups.length.toString(), color: "#10b981" },
          { icon: <GraduationCap size={16} />, label: "Alunos alocados", value: totalMembers.toString(), color: "#6366f1" },
          { icon: <CheckCircle2 size={16} />, label: "Notas lançadas", value: `${completedGroups}/${expertGroups.length}`, color: "#f59e0b" },
          { icon: <Shuffle size={16} />, label: "Grupos Mosaico", value: homeGroups.length.toString(), color: "#ec4899" },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg p-3 border"
            style={{ backgroundColor: "oklch(0.195 0.03 264.052)", borderColor: "oklch(0.3 0.03 264.052)" }}>
            <div className="flex items-center gap-1.5 mb-1" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</span>
            </div>
            <div className="font-mono font-bold text-xl text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Phase tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: "oklch(0.22 0.03 264.052)" }}>
        {[
          { key: "fase1" as const, label: "Fase 1 — Grupos Especialistas", icon: <FlaskConical size={14} /> },
          { key: "fase2" as const, label: "Fase 2 — Grupos Mosaico", icon: <Shuffle size={14} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePhase(tab.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: activePhase === tab.key ? "oklch(0.696 0.17 162.48)" : "transparent",
              color: activePhase === tab.key ? "#fff" : "oklch(0.7 0.02 264)",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FASE 1: Expert Groups ── */}
      {activePhase === "fase1" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">
              {expertGroups.length} grupos especialistas
            </h3>
            <button
              onClick={() => refetchExpert()}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loadingExpert ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : expertGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Puzzle size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum grupo especialista encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {expertGroups.map((group: any, idx: number) => (
                <ExpertGroupCard
                  key={group.id}
                  group={group}
                  index={idx}
                  onScoresSaved={() => refetchExpert()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FASE 2: Home Groups ── */}
      {activePhase === "fase2" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-sm text-foreground">
              {homeGroups.length > 0
                ? `${homeGroups.length} grupos mosaico criados`
                : "Nenhum grupo mosaico criado ainda"}
            </h3>
            <div className="flex gap-2">
              {homeGroups.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm(`Deletar todos os ${homeGroups.length} grupos mosaico?`)) {
                      deleteHomeMutation.mutate({ classId });
                    }
                  }}
                  disabled={deleteHomeMutation.isPending}
                >
                  {deleteHomeMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Deletar grupos
                </Button>
              )}
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                style={{ backgroundColor: "#ec4899" }}
                onClick={() => generateHomeMutation.mutate({ classId })}
                disabled={generateHomeMutation.isPending || homeGroups.length > 0}
              >
                {generateHomeMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Shuffle size={13} />}
                Gerar grupos mosaico
              </Button>
            </div>
          </div>

          {homeGroups.length === 0 ? (
            <div className="rounded-xl border p-8 text-center"
              style={{ borderColor: "oklch(0.35 0.03 264.052)", backgroundColor: "oklch(0.195 0.03 264.052)" }}>
              <Shuffle size={36} className="mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="text-sm font-medium text-foreground mb-1">Grupos Mosaico não gerados</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                Cada grupo mosaico reunirá 1 especialista de cada tema (6 alunos por grupo).
                Serão criados automaticamente ~14 grupos.
              </p>
              <Button
                size="sm"
                className="gap-2"
                style={{ backgroundColor: "#ec4899" }}
                onClick={() => generateHomeMutation.mutate({ classId })}
                disabled={generateHomeMutation.isPending}
              >
                {generateHomeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
                Gerar grupos mosaico agora
              </Button>
            </div>
          ) : loadingHome ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {homeGroups.map((group: any, idx: number) => (
                <HomeGroupCard key={group.id} group={group} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
