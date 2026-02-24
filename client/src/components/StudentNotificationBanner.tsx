/**
 * StudentNotificationBanner
 * Displays unread notifications as a prominent banner at the top of the student portal.
 * Supports team allocation notifications with dismiss/mark-as-read functionality.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Bell, X, Users, CheckCircle, ChevronDown, ChevronUp,
  AlertTriangle, Info, Star
} from "lucide-react";

const ORANGE = "#F7941D";
const DARK_BG = "#0A1628";
const CARD_BG = "#0D1B2A";

interface StudentNotificationBannerProps {
  memberId: number;
  classId?: number;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  team_allocation: <Users size={20} />,
  grade_update: <Star size={20} />,
  attendance: <CheckCircle size={20} />,
  announcement: <Info size={20} />,
  reminder: <AlertTriangle size={20} />,
};

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  high: {
    bg: "rgba(247, 148, 29, 0.08)",
    border: "rgba(247, 148, 29, 0.4)",
    text: "#F7941D",
    icon: "#F7941D",
  },
  normal: {
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.3)",
    text: "#60A5FA",
    icon: "#60A5FA",
  },
  low: {
    bg: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "rgba(255, 255, 255, 0.6)",
    icon: "rgba(255, 255, 255, 0.4)",
  },
};

export default function StudentNotificationBanner({ memberId, classId }: StudentNotificationBannerProps) {
  const [expanded, setExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const { data: notifications, refetch } = trpc.studentNotifications.getMyNotifications.useQuery(
    { memberId, classId },
    { enabled: !!memberId, refetchInterval: 30000 } // Poll every 30s
  );

  const { data: unreadData } = trpc.studentNotifications.getUnreadCount.useQuery(
    { memberId },
    { enabled: !!memberId, refetchInterval: 30000 }
  );

  const markAsReadMutation = trpc.studentNotifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsReadMutation = trpc.studentNotifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const dismissMutation = trpc.studentNotifications.dismiss.useMutation({
    onSuccess: () => refetch(),
  });

  // Filter out locally dismissed notifications
  const visibleNotifications = notifications?.filter(
    (n: any) => !dismissedIds.has(n.id)
  ) || [];

  const unreadCount = unreadData?.count || 0;

  if (visibleNotifications.length === 0) return null;

  const handleDismiss = (id: number) => {
    setDismissedIds(prev => new Set(prev).add(id));
    dismissMutation.mutate({ notificationId: id, memberId });
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ notificationId: id, memberId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({ memberId });
  };

  return (
    <div className="mb-4 sm:mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-t-lg cursor-pointer"
        style={{
          backgroundColor: unreadCount > 0 ? "rgba(247, 148, 29, 0.12)" : "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${unreadCount > 0 ? "rgba(247, 148, 29, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
          borderBottom: expanded ? "none" : undefined,
          borderRadius: expanded ? "0.5rem 0.5rem 0 0" : "0.5rem",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <Bell size={20} style={{ color: unreadCount > 0 ? ORANGE : "rgba(255,255,255,0.5)" }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: "#EF4444" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="font-medium text-sm" style={{ color: unreadCount > 0 ? ORANGE : "rgba(255,255,255,0.7)" }}>
            Notificações
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal" style={{ color: "rgba(255,255,255,0.5)" }}>
                ({unreadCount} {unreadCount === 1 ? "nova" : "novas"})
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Marcar todas como lidas
            </button>
          )}
          {expanded ? (
            <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
          )}
        </div>
      </div>

      {/* Notifications List */}
      {expanded && (
        <div
          className="rounded-b-lg overflow-hidden"
          style={{
            border: `1px solid ${unreadCount > 0 ? "rgba(247, 148, 29, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
            borderTop: "none",
          }}
        >
          {visibleNotifications.map((notification: any, idx: number) => {
            const priority = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.normal;
            const icon = NOTIFICATION_ICONS[notification.type] || <Bell size={20} />;
            const isUnread = !notification.isRead;

            return (
              <div
                key={notification.id}
                className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2.5 sm:gap-3 transition-colors"
                style={{
                  backgroundColor: isUnread ? priority.bg : "rgba(255,255,255,0.01)",
                  borderBottom: idx < visibleNotifications.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{
                    backgroundColor: isUnread ? `${priority.icon}15` : "rgba(255,255,255,0.03)",
                    color: isUnread ? priority.icon : "rgba(255,255,255,0.3)",
                  }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-sm ${isUnread ? "font-semibold" : "font-normal"}`}
                      style={{ color: isUnread ? "white" : "rgba(255,255,255,0.6)" }}
                    >
                      {notification.title}
                      {isUnread && (
                        <span
                          className="inline-block w-2 h-2 rounded-full ml-2 align-middle"
                          style={{ backgroundColor: ORANGE }}
                        />
                      )}
                    </h4>
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                      title="Dispensar"
                    >
                      <X size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                    </button>
                  </div>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-[10px] flex items-center gap-1 transition-colors"
                        style={{ color: ORANGE }}
                      >
                        <CheckCircle size={10} />
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Compact notification bell for the navbar
 */
export function NotificationBell({ memberId }: { memberId: number }) {
  const { data: unreadData } = trpc.studentNotifications.getUnreadCount.useQuery(
    { memberId },
    { enabled: !!memberId, refetchInterval: 30000 }
  );

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative">
      <Bell size={18} style={{ color: unreadCount > 0 ? ORANGE : "rgba(255,255,255,0.5)" }} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ backgroundColor: "#EF4444" }}
        >
          {unreadCount > 9 ? "+" : unreadCount}
        </span>
      )}
    </div>
  );
}
