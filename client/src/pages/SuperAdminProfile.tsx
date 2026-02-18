import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Shield, Users, GraduationCap, Trophy, Zap, Activity,
  CheckCircle, Clock, ArrowLeft, TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";

/**
 * Super Admin Profile Page
 * Displays permissions, system statistics, and recent activities
 */
export default function SuperAdminProfile() {
  const [, setLocation] = useLocation();
  const [teacherToken, setTeacherToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("teacherSessionToken");
    if (!token) {
      setLocation("/professor/login");
      return;
    }
    setTeacherToken(token);
  }, [setLocation]);

  const { data: profile, isLoading: profileLoading } = trpc.superAdmin.getProfile.useQuery(
    { sessionToken: teacherToken! },
    { enabled: !!teacherToken }
  );

  const { data: stats, isLoading: statsLoading } = trpc.superAdmin.getStats.useQuery(
    { sessionToken: teacherToken! },
    { enabled: !!teacherToken }
  );

  const { data: activities, isLoading: activitiesLoading } = trpc.superAdmin.getRecentActivities.useQuery(
    { sessionToken: teacherToken!, limit: 10 },
    { enabled: !!teacherToken }
  );

  if (!teacherToken) return null;

  const isLoading = profileLoading || statsLoading || activitiesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
        <div className="container max-w-6xl py-6">
          <button
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft size={14} /> Voltar ao Painel
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Shield size={32} className="text-amber-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                {profile?.name || "Super Admin"}
              </h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                  Super Administrador
                </span>
                <span className="text-xs text-muted-foreground">
                  • Desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-8">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Permissions & Profile */}
            <div className="lg:col-span-1 space-y-6">
              {/* Permissions Card */}
              <div className="border border-border rounded-lg p-6" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-primary" />
                  Permissões
                </h2>
                <ul className="space-y-2">
                  {profile?.permissions.map((perm, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Last Login */}
              <div className="border border-border rounded-lg p-6" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  Último Acesso
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.lastLoginAt 
                    ? new Date(profile.lastLoginAt).toLocaleString('pt-BR')
                    : 'Nunca'}
                </p>
              </div>
            </div>

            {/* Right Column: Stats & Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* System Statistics */}
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4">Estatísticas do Sistema</h2>
                
                {/* System Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-4 text-center"
                    style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                  >
                    <Trophy size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-mono font-bold text-2xl text-foreground">{stats?.system.totalTeams}</div>
                    <div className="text-xs text-muted-foreground">Equipes</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="border border-border rounded-lg p-4 text-center"
                    style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                  >
                    <GraduationCap size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-mono font-bold text-2xl text-foreground">{stats?.system.totalMembers}</div>
                    <div className="text-xs text-muted-foreground">Alunos</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border border-border rounded-lg p-4 text-center"
                    style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                  >
                    <Zap size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-mono font-bold text-2xl text-foreground">{stats?.system.totalXP}</div>
                    <div className="text-xs text-muted-foreground">PF Total</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="border border-border rounded-lg p-4 text-center"
                    style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                  >
                    <TrendingUp size={24} className="mx-auto mb-2 text-primary" />
                    <div className="font-mono font-bold text-2xl text-foreground">{stats?.system.avgXPPerMember}</div>
                    <div className="text-xs text-muted-foreground">Média PF</div>
                  </motion.div>
                </div>

                {/* Teachers & Students Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      Professores
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-mono text-foreground">{stats?.teachers.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ativos:</span>
                        <span className="font-mono text-green-500">{stats?.teachers.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inativos:</span>
                        <span className="font-mono text-red-500">{stats?.teachers.inactive}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordenadores:</span>
                        <span className="font-mono text-amber-500">{stats?.teachers.coordenadores}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <GraduationCap size={16} className="text-primary" />
                      Alunos
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de membros:</span>
                        <span className="font-mono text-foreground">{stats?.students.totalMembers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contas criadas:</span>
                        <span className="font-mono text-foreground">{stats?.students.totalAccounts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contas ativas:</span>
                        <span className="font-mono text-green-500">{stats?.students.activeAccounts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sem conta:</span>
                        <span className="font-mono text-muted-foreground">{stats?.students.withoutAccount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div>
                <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Atividades Recentes
                </h2>
                {!activities || activities.length === 0 ? (
                  <div className="border border-border rounded-lg p-8 text-center" style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}>
                    <Activity size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma atividade registrada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border border-border rounded-lg p-4"
                        style={{ backgroundColor: "oklch(0.195 0.03 264.052)" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Activity size={16} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.entityType} {activity.entityId ? `#${activity.entityId}` : ''}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {activity.details}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
