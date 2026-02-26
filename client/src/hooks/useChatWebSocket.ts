import { useEffect, useRef, useCallback, useState } from "react";

interface ChatMessage {
  conversationId: number;
  senderId: number;
  senderType: "student" | "teacher";
  content: string;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  data?: ChatMessage;
  userId?: number;
  userType?: string;
  conversationId?: number;
  message?: string;
  clientId?: string;
}

export function useChatWebSocket(userId: number, userType: "student" | "teacher") {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messageHandlersRef = useRef<Map<string, (message: WebSocketMessage) => void>>(new Map());

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setError(null);

        // Authenticate
        ws.send(JSON.stringify({
          type: "auth",
          userId,
          userType,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("[WebSocket] Received:", message);

          if (message.type === "message" && message.data) {
            setMessages((prev) => [...prev, message.data!]);
          }

          // Call registered handlers
          messageHandlersRef.current.forEach((handler) => {
            handler(message);
          });
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error:", event);
        setError("Erro de conexão com o servidor");
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
      };

      wsRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error("[WebSocket] Failed to create connection:", error);
      setError("Falha ao conectar ao servidor");
    }
  }, [userId, userType]);

  // Join a conversation
  const joinConversation = useCallback((conversationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "join",
        conversationId,
      }));
    }
  }, []);

  // Send a message
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "message",
        conversationId,
        content,
      }));
    }
  }, []);

  // Leave a conversation
  const leaveConversation = useCallback((conversationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "leave",
        conversationId,
      }));
    }
  }, []);

  // Register a message handler
  const onMessage = useCallback((key: string, handler: (message: WebSocketMessage) => void) => {
    messageHandlersRef.current.set(key, handler);
    return () => {
      messageHandlersRef.current.delete(key);
    };
  }, []);

  return {
    isConnected,
    error,
    messages,
    joinConversation,
    sendMessage,
    leaveConversation,
    onMessage,
  };
}
