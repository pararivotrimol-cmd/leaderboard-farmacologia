import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap, UserPlus, Trash2, ArrowLeft, Search,
  RefreshCw, Shield, CheckCircle, XCircle, Mail
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const TEACHER_SESSION_KEY = "teacherSessionToken";

export default function AdminMonitors() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMonitorEmail, setNewMonitorEmail] = useState("");
  const [newMonitorName, setNewMonitorName] = useState("");
  const [newMonitorPassword, setNewMonitorPassword] = useState("");

  const sessionToken = localStorage.getItem(TEACHER_SESSION_KEY) || "";

  // Fetch all student accounts with accountType = 'monitor'
  const { data: monitorsData, refetch: refetchMonitors, isLoading } = trpc.monitors.list.useQuery(
    { teacherSessionToken: sessionToken },
    { enabled: !!sessionToken }
  );

  // Fetch all student accounts (to promote existing ones) - use monitors.listStudents if available
  const studentsData = null;

  const registerMonitor = trpc.monitors.register.useMutation({
    // uses teacherSessionToken
    onSuccess: () => {
      toast.success("Monitor cadastrado com sucesso!");
      setNewMonitorEmail("");
      setNewMonitorName("");
      setNewMonitorPassword("");
      setShowAddForm(false);
      refetchMonitors();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMonitor = trpc.monitors.remove.useMutation({
    onSuccess: () => {
      toast.success("Monitor removido com sucesso!");
      refetchMonitors();
    },
    onError: (err) => toast.error(err.message),
  });

  const promoteToMonitor = trpc.monitors.promoteToMonitor.useMutation({
    onSuccess: () => {
      toast.success("Aluno promovido a monitor com sucesso!");
      refetchMonitors();
    },
    onError: (err) => toast.error(err.message),
  });

  const monitors = monitorsData || [];
  const students = (studentsData as any)?.accounts || (studentsData as any) || [];

  // Filter non-monitor students for promotion
  const nonMonitorStudents = students.filter(
    (s: any) => s.accountType !== "monitor" && s.memberId === null
  );

  const filteredMonitors = monitors.filter((m: any) =>
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/professor")}>
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-bold">Gerenciar Monitores</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {monitors.length} monitor{monitors.length !== 1 ? "es" : ""}
          </Badge>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-sm text-muted-foreground">
            <strong className="text-emerald-400">Monitores</strong> têm acesso ao portal dedicado em{" "}
            <code className="text-emerald-400">/monitor</code> com funcionalidades de gestão:
            Jogo, Turmas, Equipes, Frequências, Recursos e Seminários.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar monitor por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchMonitors()}>
            <RefreshCw size={14} />
          </Button>
          <Button
            size="sm"
            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus size={14} /> Novo Monitor
          </Button>
        </div>

        {/* Add Monitor Form */}
        {showAddForm && (
          <Card className="p-5 mb-6 border-emerald-500/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-500" />
              Cadastrar Novo Monitor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Input
                placeholder="Nome completo"
                value={newMonitorName}
                onChange={(e) => setNewMonitorName(e.target.value)}
              />
              <Input
                placeholder="Email (@edu.unirio.br)"
                value={newMonitorEmail}
                onChange={(e) => setNewMonitorEmail(e.target.value)}
                type="email"
              />
              <Input
                placeholder="Senha (CPF sem pontos)"
                value={newMonitorPassword}
                onChange={(e) => setNewMonitorPassword(e.target.value)}
                type="password"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!newMonitorEmail || !newMonitorPassword || registerMonitor.isPending}
                onClick={() =>
                  registerMonitor.mutate({
                    teacherSessionToken: sessionToken,
                    email: newMonitorEmail,
                    matricula: newMonitorEmail.split("@")[0],
                    password: newMonitorPassword,
                    displayName: newMonitorName || newMonitorEmail.split("@")[0],
                  })
                }
              >
                {registerMonitor.isPending ? "Cadastrando..." : "Cadastrar Monitor"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Monitors List */}
        <Card className="p-5 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield size={16} className="text-emerald-500" />
            Monitores Ativos ({filteredMonitors.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : filteredMonitors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
              <p>Nenhum monitor encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMonitors.map((monitor: any) => (
                <div
                  key={monitor.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-400">
                        {(monitor.displayName || monitor.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {monitor.displayName || "Sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail size={10} /> {monitor.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                    >
                      <CheckCircle size={10} className="mr-1" /> Monitor
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => {
                        if (confirm(`Remover ${monitor.email} como monitor?`)) {
                          removeMonitor.mutate({ teacherSessionToken: sessionToken, monitorId: monitor.id });
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Promote Existing Students */}
        {nonMonitorStudents.length > 0 && (
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={16} className="text-amber-500" />
              Promover Aluno Externo a Monitor ({nonMonitorStudents.length})
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Alunos externos sem equipe podem ser promovidos a monitores.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nonMonitorStudents.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div>
                    <p className="text-sm font-medium">{student.displayName || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                    onClick={() =>
                      promoteToMonitor.mutate({ teacherSessionToken: sessionToken, studentAccountId: student.id, displayName: student.displayName || student.email.split("@")[0] })
                    }
                    disabled={promoteToMonitor.isPending}
                  >
                    <GraduationCap size={12} className="mr-1" /> Promover
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
