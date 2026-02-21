import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Clock, Filter, Search, User, Activity, Trash2, Edit2, Plus, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Audit Log Manager - Timeline de ações administrativas
 */
export function AuditLogManager({ teacherToken }: { teacherToken: string | null }) {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterTeacher, setFilterTeacher] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Query audit logs from tRPC
  const { data: auditLogs = [], isLoading } = trpc.audit.getLogs.useQuery({
    action: filterAction !== "all" ? filterAction : undefined,
    teacherEmail: filterTeacher !== "all" ? filterTeacher : undefined,
    searchTerm: searchTerm || undefined,
    limit: 100,
    offset: 0,
  });

  // Get unique teachers for filter
  const { data: teachers = [] } = trpc.audit.getTeachers.useQuery();

  // Get unique actions for filter
  const { data: actions = [] } = trpc.audit.getActions.useQuery();

  // Get statistics
  const { data: stats } = trpc.audit.getStats.useQuery();

  // Action labels
  const actionLabels: Record<string, { label: string; icon: any; color: string }> = {
    update_xp: { label: "Atualização de PF", icon: <Edit2 size={14} />, color: "text-blue-400" },
    create_team: { label: "Criação de Equipe", icon: <Plus size={14} />, color: "text-green-400" },
    delete_team: { label: "Remoção de Equipe", icon: <Trash2 size={14} />, color: "text-red-400" },
    create_member: { label: "Adição de Aluno", icon: <UserPlus size={14} />, color: "text-green-400" },
    delete_member: { label: "Remoção de Aluno", icon: <Trash2 size={14} />, color: "text-red-400" },
    update_member: { label: "Atualização de Aluno", icon: <Edit2 size={14} />, color: "text-blue-400" },
    import_students: { label: "Importação de Alunos", icon: <UserPlus size={14} />, color: "text-purple-400" },
    update_settings: { label: "Alteração de Configurações", icon: <Edit2 size={14} />, color: "text-amber-400" },
  };

  // Logs are already filtered by the query, so we can use them directly
  const filteredLogs = auditLogs;

  // Map teachers for filter dropdown
  const uniqueTeachers = teachers.map(t => t.email);

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">Auditoria de Ações</h1>
        <p className="text-muted-foreground">Timeline completo de todas as ações administrativas realizadas no sistema</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por professor ou detalhes..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        {/* Filter by Action */}
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
          >
            <option value="all">Todas as Ações</option>
            {Object.entries(actionLabels).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Filter by Teacher */}
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={filterTeacher}
            onChange={e => setFilterTeacher(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
          >
            <option value="all">Todos os Professores</option>
            {uniqueTeachers.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <div className="text-sm text-muted-foreground mb-1">Total de Ações</div>
          <div className="text-2xl font-bold text-foreground">{auditLogs.length}</div>
        </div>
        <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <div className="text-sm text-muted-foreground mb-1">Últimas 24h</div>
          <div className="text-2xl font-bold text-primary">
            {auditLogs.filter(log => new Date().getTime() - log.createdAt.getTime() < 24 * 60 * 60 * 1000).length}
          </div>
        </div>
        <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <div className="text-sm text-muted-foreground mb-1">Professores Ativos</div>
          <div className="text-2xl font-bold text-foreground">{uniqueTeachers.length}</div>
        </div>
        <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
          <div className="text-sm text-muted-foreground mb-1">Filtrados</div>
          <div className="text-2xl font-bold text-foreground">{filteredLogs.length}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma ação encontrada com os filtros aplicados</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const actionInfo = actionLabels[log.action] || { label: log.action, icon: <Activity size={14} />, color: "text-muted-foreground" };
            let details: any = {};
            try {
              details = JSON.parse(log.details || "{}");
            } catch (e) {
              details = {};
            }

            return (
              <div key={log.id} className="border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                <div className="flex items-start gap-3">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${actionInfo.color} bg-secondary`}>
                      {actionInfo.icon}
                    </div>
                    {idx < filteredLogs.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className={`font-semibold text-sm ${actionInfo.color}`}>{actionInfo.label}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          por {log.teacherName} ({log.teacherEmail})
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(log.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-2 p-2 rounded bg-secondary/50 text-xs text-foreground">
                      {log.action === "update_xp" && (
                        <p>
                          <strong>{details.memberName}</strong>: {details.oldXP} PF → <strong className="text-primary">{details.newXP} PF</strong>
                          {details.reason && ` (${details.reason})`}
                        </p>
                      )}
                      {log.action === "create_team" && (
                        <p>
                          Equipe criada: <strong>{details.teamName}</strong> {details.emoji}
                        </p>
                      )}
                      {log.action === "delete_member" && (
                        <p>
                          Aluno removido: <strong>{details.memberName}</strong> da equipe {details.teamName}
                        </p>
                      )}
                      {log.action === "import_students" && (
                        <p>
                          <strong>{details.imported}</strong> alunos importados para <strong>{details.className}</strong>
                        </p>
                      )}
                      {log.action === "update_settings" && (
                        <p>
                          Configuração <strong>{details.setting}</strong> alterada: {details.oldValue} → <strong>{details.newValue}</strong>
                        </p>
                      )}
                      {!["update_xp", "create_team", "delete_member", "import_students", "update_settings"].includes(log.action) && (
                        <pre className="text-xs overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
