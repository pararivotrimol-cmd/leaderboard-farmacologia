/**
 * Notification Preferences Page
 * Allow students to manage notification settings and quiet hours
 */

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Clock, CheckCircle2, Circle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const ORANGE = "#F7941D";

const NOTIFICATION_TYPES = [
  { key: "team_allocation", label: "Alocacao de Equipe" },
  { key: "grade_update", label: "Atualizacao de Nota" },
  { key: "announcement", label: "Anuncio" },
  { key: "reminder", label: "Lembrete" },
  { key: "attendance", label: "Presenca" },
];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const memberId = user?.id ?? 0;

  const [enabled, setEnabled] = useState(true);
  const [enabledTypes, setEnabledTypes] = useState<string[]>([]);
  const [quietStart, setQuietStart] = useState(22);
  const [quietEnd, setQuietEnd] = useState(8);
  const [isSaving, setIsSaving] = useState(false);

  const { data: preferences } = trpc.studentNotifications.getPreferences.useQuery(
    { memberId },
    { enabled: memberId > 0 }
  );

  const updatePreferencesMutation = trpc.studentNotifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast("Preferencias atualizadas com sucesso", {
        duration: 2000,
        style: {
          background: "#0D1B2A",
          color: "#fff",
          border: `1px solid ${ORANGE}40`,
          fontSize: "13px",
        },
      });
      setIsSaving(false);
    },
    onError: () => {
      toast("Erro ao atualizar preferencias", {
        duration: 2000,
        style: {
          background: "#7F1D1D",
          color: "#fff",
          border: "1px solid #EF4444",
          fontSize: "13px",
        },
      });
      setIsSaving(false);
    },
  });

  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.enabled);
      setEnabledTypes(preferences.enabledTypes);
      setQuietStart(preferences.quietHoursStart);
      setQuietEnd(preferences.quietHoursEnd);
    }
  }, [preferences]);

  const handleSave = () => {
    setIsSaving(true);
    updatePreferencesMutation.mutate({
      memberId,
      enabled,
      enabledTypes,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
    });
  };

  const toggleType = (type: string) => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/30" style={{ backgroundColor: "oklch(0.165 0.03 264.052 / 0.95)", backdropFilter: "blur(12px)" }}>
        <div className="container py-4 flex items-center gap-3">
          <Link href="/leaderboard">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Preferencias de Notificacao</h1>
        </div>
      </div>

      <div className="container py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Enable/Disable Notifications */}
          <div className="p-6 rounded-lg border border-border/30" style={{ backgroundColor: "oklch(0.165 0.03 264.052 / 0.5)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} style={{ color: ORANGE }} />
                <div>
                  <h2 className="font-semibold text-foreground">Notificacoes Ativadas</h2>
                  <p className="text-sm text-muted-foreground">Receber notificacoes do sistema</p>
                </div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: enabled ? ORANGE : "#374151" }}
              >
                {enabled ? (
                  <CheckCircle2 size={24} className="text-white" />
                ) : (
                  <Circle size={24} className="text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Notification Types */}
          {enabled && (
            <div className="p-6 rounded-lg border border-border/30" style={{ backgroundColor: "oklch(0.165 0.03 264.052 / 0.5)" }}>
              <h2 className="font-semibold text-foreground mb-4">Tipos de Notificacao</h2>
              <div className="space-y-3">
                {NOTIFICATION_TYPES.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => toggleType(type.key)}
                    className="w-full p-3 rounded-lg border transition-colors text-left flex items-center justify-between"
                    style={{
                      backgroundColor: enabledTypes.includes(type.key) ? ORANGE + "10" : "oklch(0.165 0.03 264.052 / 0.3)",
                      borderColor: enabledTypes.includes(type.key) ? ORANGE + "40" : "oklch(0.165 0.03 264.052 / 0.5)",
                    }}
                  >
                    <span className="text-foreground">{type.label}</span>
                    {enabledTypes.includes(type.key) ? (
                      <CheckCircle2 size={20} style={{ color: ORANGE }} />
                    ) : (
                      <Circle size={20} className="text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quiet Hours */}
          {enabled && (
            <div className="p-6 rounded-lg border border-border/30" style={{ backgroundColor: "oklch(0.165 0.03 264.052 / 0.5)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} style={{ color: ORANGE }} />
                <h2 className="font-semibold text-foreground">Horario Silencioso</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Nao receber notificacoes durante este periodo</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Inicio</label>
                  <select
                    value={quietStart}
                    onChange={(e) => setQuietStart(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground border border-border/30 focus:outline-none focus:border-border/60 transition-colors"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Fim</label>
                  <select
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-secondary text-foreground border border-border/30 focus:outline-none focus:border-border/60 transition-colors"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Horario silencioso: {String(quietStart).padStart(2, "0")}:00 ate {String(quietEnd).padStart(2, "0")}:00
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: ORANGE }}
          >
            {isSaving ? "Salvando..." : "Salvar Preferencias"}
          </button>
        </div>
      </div>
    </div>
  );
}
