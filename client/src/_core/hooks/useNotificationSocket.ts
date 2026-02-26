import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  priority: "low" | "normal" | "high";
  createdAt: Date;
}

interface NotificationMessage {
  type: "notification";
  data: NotificationData;
}

export function useNotificationSocket(
  memberId: number | undefined,
  onNewNotification?: (notification: NotificationData) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (!memberId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws/notifications?memberId=${memberId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[WebSocket] Connected");
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message: NotificationMessage = JSON.parse(event.data);
          
          if (message.type === "notification") {
            const notification = message.data;
            
            // Show toast notification
            const priorityColor = 
              notification.priority === "high" ? "#EF4444" :
              notification.priority === "normal" ? "#F7941D" :
              "#6B7280";
            
            toast(notification.title, {
              description: notification.message,
              duration: 5000,
              style: {
                background: "#0D1B2A",
                color: "#fff",
                border: `1px solid ${priorityColor}40`,
                borderLeftWidth: "4px",
                borderLeftColor: priorityColor,
                fontSize: "13px",
              },
            });

            // Call callback if provided
            if (onNewNotification) {
              onNewNotification(notification);
            }
          }
        } catch (e) {
          console.error("[WebSocket] Error parsing message:", e);
        }
      };

      wsRef.current.onerror = (error: Event) => {
        console.error("[WebSocket] Error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("[WebSocket] Disconnected");
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[WebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, reconnectDelay);
        } else {
          console.warn("[WebSocket] Max reconnection attempts reached");
        }
      };
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
    }
  }, [memberId, onNewNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  useEffect(() => {
    connect();

    // Send ping every 25 seconds to keep connection alive
    const pingInterval = setInterval(sendPing, 25000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect, sendPing]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
  };
}
