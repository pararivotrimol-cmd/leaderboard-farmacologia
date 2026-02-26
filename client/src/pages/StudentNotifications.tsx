/**
 * Student Notifications Page (/avisos)
 * Display all notifications with read/unread status, search, and type filtering
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Trash2, Check, CheckCheck, Search, X } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useNotificationSocket } from "@/_core/hooks/useNotificationSocket";
import { toast } from "sonner";

const ORANGE = "#F7941D";

const NOTIFICATION_TYPES: Record<string, string> = {
  team_allocation: "Alocacao de Equipe",
  grade_update: "Atualizacao de Nota",
  announcement: "Anuncio",
  reminder: "Lembrete",
  attendance: "Presenca",
};

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: "low" | "normal" | "high";
  isRead: boolean;
  readAt: Date | null;
  isDismissed: boolean;
  createdAt: Date;
}

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const memberId = user?.id ?? 0;

  const { data: notificationsData, isLoading, refetch } = trpc.studentNotifications.getMyNotifications.useQuery(
    { memberId },
    { enabled: memberId > 0 }
  );

  const markAsReadMutation = trpc.studentNotifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast("Notificacao marcada como lida", {
        duration: 1500,
        style: {
          background: "#0D1B2A",
          color: "#fff",
          border: `1px solid ${ORANGE}40`,
          fontSize: "13px",
        },
      });
    },
  });

  const markAllAsReadMutation = trpc.studentNotifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
      toast("Todas as notificacoes marcadas como lidas", {
        duration: 1500,
        style: {
          background: "#0D1B2A",
          color: "#fff",
          border: `1px solid ${ORANGE}40`,
          fontSize: "13px",
        },
      });
    },
  });

  const dismissMutation = trpc.studentNotifications.dismiss.useMutation({
    onSuccess: () => {
      refetch();
      toast("Notificacao removida", {
        duration: 1500,
        style: {
          background: "#0D1B2A",
          color: "#fff",
          border: `1px solid ${ORANGE}40`,
          fontSize: "13px",
        },
      });
    },
  });

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  useNotificationSocket(memberId, (newNotification: any) => {
    setNotifications((prev) => [newNotification, ...prev]);
    refetch();
  });

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isDismissed).length;
  let filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.isRead && !n.isDismissed)
    : notifications.filter((n) => !n.isDismissed);

  if (searchQuery) {
    filteredNotifications = filteredNotifications.filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedType) {
    filteredNotifications = filteredNotifications.filter((n) => n.type === selectedType);
  }

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId, memberId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({ memberId });
  };

  const handleDismiss = (notificationId: number) => {
    dismissMutation.mutate({ notificationId, memberId });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "normal":
        return ORANGE;
      case "low":
      default:
        return "#6B7280";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atras`;
    if (diffHours < 24) return `${diffHours}h atras`;
    if (diffDays < 7) return `${diffDays}d atras`;
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/30" style={{ backgroundColor: "oklch(0.165 0.03 264.052 / 0.95)", backdropFilter: "blur(12px)" }}>
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/leaderboard">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-foreground" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Avisos</h1>
              <p className="text-xs text-muted-foreground">{unreadCount} nao lido(s)</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: ORANGE, backgroundColor: ORANGE + "10", border: `1px solid ${ORANGE}30` }}
            >
              Marcar tudo como lido
            </button>
          )}
        </div>
      </div>

      <div className="container py-4 border-b border-border/20">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar notificacoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border/30 focus:outline-none focus:border-border/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: filter === "all" ? "#fff" : ORANGE,
              backgroundColor: filter === "all" ? ORANGE : ORANGE + "10",
              borderColor: filter === "all" ? ORANGE : ORANGE + "30",
              borderWidth: "1px",
            }}
          >
            Todos ({notifications.filter((n) => !n.isDismissed).length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: filter === "unread" ? "#fff" : ORANGE,
              backgroundColor: filter === "unread" ? ORANGE : ORANGE + "10",
              borderColor: filter === "unread" ? ORANGE : ORANGE + "30",
              borderWidth: "1px",
            }}
          >
            Nao lidos ({unreadCount})
          </button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType(null)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              color: selectedType === null ? "#fff" : "#9CA3AF",
              backgroundColor: selectedType === null ? "#6B7280" : "#374151",
              borderWidth: "1px",
              borderColor: selectedType === null ? "#6B7280" : "#4B5563",
            }}
          >
            Todos os tipos
          </button>
          {Object.entries(NOTIFICATION_TYPES).map(([typeKey, typeLabel]) => (
            <button
              key={typeKey}
              onClick={() => setSelectedType(typeKey)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                color: selectedType === typeKey ? "#fff" : "#9CA3AF",
                backgroundColor: selectedType === typeKey ? ORANGE : "#374151",
                borderWidth: "1px",
                borderColor: selectedType === typeKey ? ORANGE : "#4B5563",
              }}
            >
              {typeLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando avisos...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {filter === "unread" ? "Nenhum aviso nao lido" : "Nenhum aviso"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {filteredNotifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: notification.isRead ? "oklch(0.165 0.03 264.052 / 0.5)" : "oklch(0.165 0.03 264.052 / 0.8)",
                    borderColor: notification.isRead ? "oklch(0.165 0.03 264.052 / 0.3)" : getPriorityColor(notification.priority) + "40",
                    borderLeftWidth: "4px",
                    borderLeftColor: getPriorityColor(notification.priority),
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ORANGE }} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70">{formatDate(notification.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          title="Marcar como lido"
                        >
                          <Check size={18} className="text-muted-foreground" />
                        </button>
                      )}
                      {notification.isRead && (
                        <CheckCheck size={18} className="text-muted-foreground/50" />
                      )}
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={18} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
