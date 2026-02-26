import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "activity" | "feedback" | "message" | "achievement";
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface WebSocketNotification {
  type: string;
  notificationId?: string;
  notificationType?: string;
  title?: string;
  content?: string;
  actionUrl?: string;
  userId?: number;
  userType?: string;
  message?: string;
}

export function useNotifications(userId: number | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Connect to WebSocket for notifications
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
        // Fallback to polling if WebSocket is not available
        if (!wsUrl) return;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("[Notifications WebSocket] Connected");
          setIsConnected(true);
          setError(null);

          // Authenticate
          ws.send(JSON.stringify({
            type: "auth",
            userId,
            userType: "student",
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketNotification = JSON.parse(event.data);

            if (message.type === "notification") {
              const notification: Notification = {
                id: message.notificationId || `notif-${Date.now()}`,
                type: (message.notificationType as any) || "activity",
                title: message.title || "Nova Notificação",
                content: message.content || "",
                timestamp: new Date(),
                read: false,
                actionUrl: message.actionUrl,
              };

              // Add notification to state
              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);

              // Show toast notification
              const toastMessage = `${notification.title}: ${notification.content}`;
              if (notification.actionUrl) {
                toast(toastMessage, {
                  action: {
                    label: "Ver",
                    onClick: () => {
                      window.location.href = notification.actionUrl!;
                    },
                  },
                });
              } else {
                toast(toastMessage);
              }
            }
          } catch (err) {
            console.error("[Notifications] Error parsing message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("[Notifications WebSocket] Error:", error);
          setError("Erro ao conectar notificações");
        };

        ws.onclose = () => {
          console.log("[Notifications WebSocket] Disconnected");
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[Notifications] Attempting to reconnect...");
            connectWebSocket();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("[Notifications] Connection error:", err);
        setError("Falha ao conectar ao servidor de notificações");
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Send read status to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "mark_read",
          notificationId,
        })
      );
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Send mark all read to server
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "mark_all_read",
        })
      );
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
