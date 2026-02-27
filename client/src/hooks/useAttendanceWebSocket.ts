import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface AttendanceNotification {
  studentName: string;
  studentId: number;
  timestamp: string;
  classId: number;
  status: "present" | "absent" | "justified";
}

export function useAttendanceWebSocket(
  classId: number,
  enabled: boolean = true,
  onNotification?: (notification: AttendanceNotification) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/attendance/${classId}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("[Attendance WebSocket] Connected");
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as AttendanceNotification;

          // Show toast notification
          const time = new Date(data.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const statusLabel =
            data.status === "present"
              ? "✅ Presente"
              : data.status === "absent"
                ? "❌ Ausente"
                : "⚠️ Justificada";

          toast.success(`${data.studentName} - ${statusLabel} às ${time}`);

          // Call callback if provided
          onNotification?.(data);
        } catch (error) {
          console.error("[Attendance WebSocket] Error parsing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("[Attendance WebSocket] Error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("[Attendance WebSocket] Disconnected");
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error("[Attendance WebSocket] Connection error:", error);
    }
  }, [classId, enabled, onNotification]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
    reconnect: connect,
  };
}
