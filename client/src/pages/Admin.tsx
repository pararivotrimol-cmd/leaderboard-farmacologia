import { useState, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LogOut, Users, UserPlus, Trash2, Edit2, Save, X,
  Plus, Trophy, Zap, Activity, Settings, ChevronDown, ChevronUp,
  FlaskConical, ArrowLeft, KeyRound
} from "lucide-react";

// ─── Login Screen ───
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const loginMutation = trpc.admin.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ password });
      if (result.success) {
        toast.success("Autenticado com sucesso!");
        onLogin(password);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Erro ao autenticar");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Farmacologia I — Leaderboard XP</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Senha do Professor</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha..."
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Voltar ao Leaderboard
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Team Management ───
function TeamManager({ password }: { password: string }) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEmoji, setNewTeamEmoji] = useState("🧪");
  const [newTeamColor, setNewTeamColor] = useState("#10b981");
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editColor, setEditColor] = useState("");
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: leaderboard, isLoading } = trpc.leaderboard.getData.useQuery();

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Equipe criada!"); setNewTeamName(""); },
    onError: () => toast.error("Erro ao criar equipe"),
  });

  const updateTeam = trpc.teams.update.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Equipe atualizada!"); setEditingTeam(null); },
    onError: () => toast.error("Erro ao atualizar equipe"),
  });

  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Equipe removida!"); },
    onError: () => toast.error("Erro ao remover equipe"),
  });

  if (isLoading) return <div className="text-center text-muted-foreground py-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Add Team */}
      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Adicionar Equipe
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newTeamEmoji}
            onChange={e => setNewTeamEmoji(e.target.value)}
            className="w-12 px-2 py-2 rounded-md bg-secondary border border-border text-foreground text-center text-sm"
            placeholder="🧪"
          />
          <input
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm"
            placeholder="Nome da equipe..."
          />
          <input
            type="color"
            value={newTeamColor}
            onChange={e => setNewTeamColor(e.target.value)}
            className="w-10 h-10 rounded-md border border-border cursor-pointer"
          />
          <button
            onClick={() => createTeam.mutate({ password, name: newTeamName, emoji: newTeamEmoji, color: newTeamColor })}
            disabled={!newTeamName || createTeam.isPending}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Criar
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="space-y-2">
        {leaderboard?.teams.map(team => (
          <div key={team.id} className="border border-border rounded-lg overflow-hidden" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
            <div className="p-3 flex items-center gap-3">
              {editingTeam === team.id ? (
                <>
                  <input value={editEmoji} onChange={e => setEditEmoji(e.target.value)} className="w-10 px-1 py-1 rounded bg-secondary border border-border text-center text-sm text-foreground" />
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-2 py-1 rounded bg-secondary border border-border text-sm text-foreground" />
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <button onClick={() => updateTeam.mutate({ password, id: team.id, name: editName, emoji: editEmoji, color: editColor })} className="p-1.5 rounded bg-primary/20 text-primary"><Save size={14} /></button>
                  <button onClick={() => setEditingTeam(null)} className="p-1.5 rounded bg-destructive/20 text-destructive"><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="text-lg">{team.emoji}</span>
                  <span className="font-medium text-sm text-foreground flex-1">{team.name}</span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-xs text-muted-foreground font-mono">{team.members.length} membros</span>
                  <span className="text-xs font-mono font-bold" style={{ color: team.color }}>
                    {team.members.reduce((s, m) => s + m.xp, 0).toFixed(1)} XP
                  </span>
                  <button onClick={() => { setEditingTeam(team.id); setEditName(team.name); setEditEmoji(team.emoji); setEditColor(team.color); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><Edit2 size={14} /></button>
                  <button onClick={() => { if (confirm(`Remover equipe "${team.name}" e todos os membros?`)) deleteTeam.mutate({ password, id: team.id }); }} className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 size={14} /></button>
                  <button onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground">
                    {expandedTeam === team.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </>
              )}
            </div>
            <AnimatePresence>
              {expandedTeam === team.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <MemberList teamId={team.id} members={team.members} password={password} teamColor={team.color} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Member List (inside team) ───
function MemberList({ teamId, members, password, teamColor }: {
  teamId: number;
  members: { id: number; name: string; xp: number }[];
  password: string;
  teamColor: string;
}) {
  const [newName, setNewName] = useState("");
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editXP, setEditXP] = useState("");

  const utils = trpc.useUtils();

  const createMember = trpc.members.create.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Aluno adicionado!"); setNewName(""); },
    onError: () => toast.error("Erro ao adicionar aluno"),
  });

  const updateMember = trpc.members.update.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Aluno atualizado!"); setEditingMember(null); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMember = trpc.members.delete.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Aluno removido!"); },
    onError: () => toast.error("Erro ao remover"),
  });

  return (
    <div className="border-t border-border/50 px-3 pb-3 pt-2">
      {/* Add member */}
      <div className="flex gap-2 mb-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground"
          placeholder="Nome do aluno..."
          onKeyDown={e => { if (e.key === "Enter" && newName) createMember.mutate({ password, teamId, name: newName }); }}
        />
        <button
          onClick={() => createMember.mutate({ password, teamId, name: newName })}
          disabled={!newName || createMember.isPending}
          className="px-3 py-1.5 rounded bg-primary/20 text-primary text-xs font-medium disabled:opacity-50"
        >
          <UserPlus size={14} />
        </button>
      </div>

      {/* Members */}
      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum aluno nesta equipe</p>
      ) : (
        <div className="space-y-1">
          {members.sort((a, b) => b.xp - a.xp).map(member => (
            <div key={member.id} className="flex items-center gap-2 py-1">
              {editingMember === member.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-2 py-1 rounded bg-secondary border border-border text-xs text-foreground" />
                  <input value={editXP} onChange={e => setEditXP(e.target.value)} className="w-16 px-2 py-1 rounded bg-secondary border border-border text-xs text-foreground text-right font-mono" type="number" step="0.5" />
                  <button onClick={() => updateMember.mutate({ password, id: member.id, name: editName, xp: editXP })} className="p-1 rounded bg-primary/20 text-primary"><Save size={12} /></button>
                  <button onClick={() => setEditingMember(null)} className="p-1 rounded bg-destructive/20 text-destructive"><X size={12} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-foreground truncate">{member.name}</span>
                  <span className="font-mono text-xs font-bold w-12 text-right" style={{ color: teamColor }}>{member.xp.toFixed(1)}</span>
                  <button onClick={() => { setEditingMember(member.id); setEditName(member.name); setEditXP(member.xp.toFixed(1)); }} className="p-1 rounded hover:bg-secondary text-muted-foreground"><Edit2 size={12} /></button>
                  <button onClick={() => { if (confirm(`Remover "${member.name}"?`)) deleteMember.mutate({ password, id: member.id }); }} className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 size={12} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bulk XP Update ───
function BulkXPManager({ password }: { password: string }) {
  const { data: leaderboard } = trpc.leaderboard.getData.useQuery();
  const [xpUpdates, setXpUpdates] = useState<Record<number, string>>({});
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const bulkUpdate = trpc.members.bulkUpdateXP.useMutation({
    onSuccess: (data) => {
      utils.leaderboard.getData.invalidate();
      toast.success(`${data.count} alunos atualizados!`);
      setXpUpdates({});
    },
    onError: () => toast.error("Erro ao atualizar XP"),
  });

  const filteredTeams = leaderboard?.teams ?? [];
  const displayTeams = selectedTeam ? filteredTeams.filter(t => t.id === selectedTeam) : filteredTeams;

  const handleSave = () => {
    const updates = Object.entries(xpUpdates)
      .filter(([_, xp]) => xp !== "")
      .map(([id, xp]) => ({ id: parseInt(id), xp }));
    if (updates.length === 0) { toast.info("Nenhuma alteração para salvar"); return; }
    bulkUpdate.mutate({ password, updates });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedTeam ?? ""}
          onChange={e => setSelectedTeam(e.target.value ? parseInt(e.target.value) : null)}
          className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm"
        >
          <option value="">Todas as equipes</option>
          {filteredTeams.map(t => (
            <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={Object.keys(xpUpdates).length === 0 || bulkUpdate.isPending}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save size={14} /> Salvar Alterações ({Object.keys(xpUpdates).filter(k => xpUpdates[parseInt(k)] !== "").length})
        </button>
      </div>

      {displayTeams.map(team => (
        <div key={team.id} className="border border-border rounded-lg p-3" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{team.emoji}</span>
            <span className="font-display font-semibold text-sm text-foreground">{team.name}</span>
            <span className="text-xs text-muted-foreground ml-auto font-mono">
              Total: {team.members.reduce((s, m) => s + (xpUpdates[m.id] !== undefined ? parseFloat(xpUpdates[m.id] || "0") : m.xp), 0).toFixed(1)} XP
            </span>
          </div>
          <div className="grid gap-1.5">
            {team.members.sort((a, b) => a.name.localeCompare(b.name)).map(member => (
              <div key={member.id} className="flex items-center gap-2">
                <span className="flex-1 text-xs text-foreground truncate">{member.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono w-12 text-right">atual: {member.xp.toFixed(1)}</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="45"
                  value={xpUpdates[member.id] ?? member.xp.toFixed(1)}
                  onChange={e => setXpUpdates(prev => ({ ...prev, [member.id]: e.target.value }))}
                  className={`w-20 px-2 py-1 rounded bg-secondary border text-xs text-foreground text-right font-mono ${
                    xpUpdates[member.id] !== undefined ? "border-primary" : "border-border"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activities Manager ───
function ActivitiesManager({ password }: { password: string }) {
  const { data: leaderboard } = trpc.leaderboard.getData.useQuery();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🎯");
  const [newMaxXP, setNewMaxXP] = useState("1");
  const utils = trpc.useUtils();

  const createActivity = trpc.activities.create.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Atividade criada!"); setNewName(""); setNewIcon("🎯"); setNewMaxXP("1"); },
  });

  const deleteActivity = trpc.activities.delete.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Atividade removida!"); },
  });

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Nova Atividade
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input value={newIcon} onChange={e => setNewIcon(e.target.value)} className="w-12 px-2 py-2 rounded-md bg-secondary border border-border text-foreground text-center text-sm" />
          <input value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 min-w-[150px] px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Nome da atividade..." />
          <input value={newMaxXP} onChange={e => setNewMaxXP(e.target.value)} type="number" step="0.5" className="w-20 px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm text-right font-mono" placeholder="XP" />
          <button onClick={() => createActivity.mutate({ password, name: newName, icon: newIcon, maxXP: newMaxXP })} disabled={!newName} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Criar</button>
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard?.activities.map(act => (
          <div key={act.id} className="border border-border rounded-lg p-3 flex items-center gap-3" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
            <span className="text-xl">{act.icon}</span>
            <span className="flex-1 text-sm text-foreground font-medium">{act.name}</span>
            <span className="font-mono text-sm text-primary font-bold">+{act.maxXP}</span>
            <button onClick={() => { if (confirm(`Remover "${act.name}"?`)) deleteActivity.mutate({ password, id: act.id }); }} className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 size={14} /></button>
          </div>
        ))}
        {(!leaderboard?.activities || leaderboard.activities.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade cadastrada</p>
        )}
      </div>
    </div>
  );
}

// ─── Highlights Manager ───
function HighlightsManager({ password }: { password: string }) {
  const { data: leaderboard } = trpc.leaderboard.getData.useQuery();
  const [week, setWeek] = useState("");
  const [date, setDate] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [topTeam, setTopTeam] = useState("");
  const [topStudent, setTopStudent] = useState("");
  const utils = trpc.useUtils();

  const createHighlight = trpc.highlights.create.useMutation({
    onSuccess: () => {
      utils.leaderboard.getData.invalidate();
      toast.success("Destaque adicionado!");
      setWeek(""); setDate(""); setActivity(""); setDescription(""); setTopTeam(""); setTopStudent("");
    },
  });

  const deleteHighlight = trpc.highlights.delete.useMutation({
    onSuccess: () => { utils.leaderboard.getData.invalidate(); toast.success("Destaque removido!"); },
  });

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Novo Destaque Semanal
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <input value={week} onChange={e => setWeek(e.target.value)} type="number" className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Semana (1-16)" />
          <input value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Data (ex: 10/03/2026)" />
          <input value={activity} onChange={e => setActivity(e.target.value)} className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Atividade" />
          <input value={topTeam} onChange={e => setTopTeam(e.target.value)} className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Equipe destaque" />
          <input value={topStudent} onChange={e => setTopStudent(e.target.value)} className="px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Aluno destaque" />
          <input value={description} onChange={e => setDescription(e.target.value)} className="col-span-2 px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Descrição do destaque..." />
        </div>
        <button
          onClick={() => createHighlight.mutate({ password, week: parseInt(week), date, activity, description, topTeam: topTeam || "—", topStudent: topStudent || "—" })}
          disabled={!week || !date || !activity || !description}
          className="mt-3 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          Adicionar Destaque
        </button>
      </div>

      <div className="space-y-2">
        {leaderboard?.highlights.map(h => (
          <div key={h.id} className="border border-border rounded-lg p-3" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-primary">SEM {h.week}</span>
              <span className="text-xs text-muted-foreground">{h.date}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{h.activity}</span>
              <button onClick={() => { if (confirm("Remover destaque?")) deleteHighlight.mutate({ password, id: h.id }); }} className="ml-auto p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 size={12} /></button>
            </div>
            <p className="text-xs text-foreground">{h.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ───
function SettingsManager({ password }: { password: string }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const changePw = trpc.admin.changePassword.useMutation({
    onSuccess: (data) => {
      if (data.success) { toast.success(data.message); setCurrentPw(""); setNewPw(""); }
      else toast.error(data.message);
    },
  });

  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => toast.success("Configuração salva!"),
  });

  const { data: leaderboard } = trpc.leaderboard.getData.useQuery();
  const [currentWeek, setCurrentWeek] = useState(leaderboard?.settings?.currentWeek || "5");

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <KeyRound size={16} className="text-primary" /> Alterar Senha
        </h3>
        <div className="space-y-2">
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Senha atual" />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm" placeholder="Nova senha (mín. 6 caracteres)" />
          <button onClick={() => changePw.mutate({ currentPassword: currentPw, newPassword: newPw })} disabled={!currentPw || newPw.length < 6} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Alterar Senha</button>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Settings size={16} className="text-primary" /> Semana Atual
        </h3>
        <div className="flex gap-2">
          <input type="number" min="1" max="16" value={currentWeek} onChange={e => setCurrentWeek(e.target.value)} className="w-20 px-3 py-2 rounded-md bg-secondary border border-border text-foreground text-sm font-mono" />
          <button onClick={() => updateSetting.mutate({ password, key: "currentWeek", value: currentWeek })} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ───
export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"teams" | "xp" | "activities" | "highlights" | "settings">("teams");

  if (!password) return <LoginScreen onLogin={setPassword} />;

  const sections = [
    { key: "teams" as const, label: "Equipes", icon: <Users size={16} /> },
    { key: "xp" as const, label: "Atualizar XP", icon: <Zap size={16} /> },
    { key: "activities" as const, label: "Atividades", icon: <Trophy size={16} /> },
    { key: "highlights" as const, label: "Destaques", icon: <Activity size={16} /> },
    { key: "settings" as const, label: "Configurações", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container py-4 flex items-center gap-3">
          <FlaskConical size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground flex-1">Painel Admin</h1>
          <a href="/" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mr-3">
            <ArrowLeft size={12} /> Leaderboard
          </a>
          <button onClick={() => setPassword(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="container py-4">
        <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 w-fit flex-wrap">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeSection === s.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-16">
        {activeSection === "teams" && <TeamManager password={password} />}
        {activeSection === "xp" && <BulkXPManager password={password} />}
        {activeSection === "activities" && <ActivitiesManager password={password} />}
        {activeSection === "highlights" && <HighlightsManager password={password} />}
        {activeSection === "settings" && <SettingsManager password={password} />}
      </div>
    </div>
  );
}
