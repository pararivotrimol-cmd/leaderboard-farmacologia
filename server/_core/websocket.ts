import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import type { IncomingMessage } from "http";

interface NotificationMessage {
  type: "notification";
  data: {
    id: number;
    title: string;
    message: string;
    notificationType: string;
    priority: "low" | "normal" | "high";
    createdAt: Date;
  };
}

interface ClientConnection {
  ws: WebSocket;
  memberId: number;
  isAlive: boolean;
}

class NotificationWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<number, Set<ClientConnection>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/api/ws/notifications" });
    this.setupServer();
  }

  private setupServer() {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      // Extract memberId from query params or headers
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const memberId = parseInt(url.searchParams.get("memberId") || "0");

      if (!memberId) {
        ws.close(1008, "Missing memberId");
        return;
      }

      const connection: ClientConnection = { ws, memberId, isAlive: true };

      // Register client
      if (!this.clients.has(memberId)) {
        this.clients.set(memberId, new Set());
      }
      this.clients.get(memberId)!.add(connection);

      console.log(`[WebSocket] Client connected: memberId=${memberId}`);

      // Handle ping/pong for connection health
      ws.on("pong", () => {
        connection.isAlive = true;
      });

      ws.on("message", (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        } catch (e) {
          console.error("[WebSocket] Error parsing message:", e);
        }
      });

      ws.on("close", () => {
        const connections = this.clients.get(memberId);
        if (connections) {
          connections.delete(connection);
          if (connections.size === 0) {
            this.clients.delete(memberId);
          }
        }
        console.log(`[WebSocket] Client disconnected: memberId=${memberId}`);
      });

      ws.on("error", (error: Error) => {
        console.error("[WebSocket] Error:", error);
      });
    });

    // Heartbeat to detect stale connections
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const connection = Array.from(this.clients.values())
          .flatMap((set) => Array.from(set))
          .find((c) => c.ws === ws);

        if (!connection) return;

        if (!connection.isAlive) {
          ws.terminate();
          return;
        }

        connection.isAlive = false;
        ws.ping();
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Send notification to a specific member
   */
  public sendNotification(memberId: number, notification: NotificationMessage["data"]) {
    const connections = this.clients.get(memberId);
    if (!connections) return;

    const message: NotificationMessage = {
      type: "notification",
      data: notification,
    };

    const payload = JSON.stringify(message);
    connections.forEach((connection) => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(payload);
      }
    });

    console.log(`[WebSocket] Notification sent to memberId=${memberId}`);
  }

  /**
   * Broadcast notification to multiple members
   */
  public broadcastNotification(memberIds: number[], notification: NotificationMessage["data"]) {
    memberIds.forEach((memberId) => {
      this.sendNotification(memberId, notification);
    });
  }

  /**
   * Get connection count for a member
   */
  public getConnectionCount(memberId: number): number {
    return this.clients.get(memberId)?.size ?? 0;
  }

  /**
   * Get total active connections
   */
  public getTotalConnections(): number {
    return Array.from(this.clients.values()).reduce((sum, set) => sum + set.size, 0);
  }
}

let wsManager: NotificationWebSocketManager | null = null;

export function initializeWebSocket(server: Server): NotificationWebSocketManager {
  if (!wsManager) {
    wsManager = new NotificationWebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): NotificationWebSocketManager {
  if (!wsManager) {
    throw new Error("WebSocket manager not initialized");
  }
  return wsManager;
}
