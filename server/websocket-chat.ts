import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface ChatMessage {
  conversationId: number;
  senderId: number;
  senderType: "student" | "teacher";
  content: string;
  timestamp: string;
}

interface ClientConnection {
  ws: WebSocket;
  userId: number;
  userType: "student" | "teacher";
  conversationIds: Set<number>;
}

const clients = new Map<string, ClientConnection>();

export function initializeChatWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  wss.on("connection", (ws: WebSocket) => {
    const clientId = generateClientId();
    console.log(`[WebSocket] Client connected: ${clientId}`);

    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        handleMessage(clientId, message, ws);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Error for client ${clientId}:`, error);
    });
  });

  return wss;
}

function generateClientId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function handleMessage(clientId: string, message: any, ws: WebSocket) {
  switch (message.type) {
    case "auth":
      handleAuth(clientId, message, ws);
      break;
    case "join":
      handleJoin(clientId, message, ws);
      break;
    case "message":
      handleChatMessage(clientId, message);
      break;
    case "leave":
      handleLeave(clientId, message);
      break;
    default:
      ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
  }
}

function handleAuth(clientId: string, message: any, ws: WebSocket) {
  const { userId, userType } = message;

  if (!userId || !userType || !["student", "teacher"].includes(userType)) {
    ws.send(JSON.stringify({ type: "error", message: "Invalid auth data" }));
    return;
  }

  const client: ClientConnection = {
    ws,
    userId,
    userType,
    conversationIds: new Set(),
  };

  clients.set(clientId, client);
  ws.send(JSON.stringify({ type: "auth_success", clientId, userId }));
  console.log(`[WebSocket] User authenticated: ${userId} (${userType})`);
}

function handleJoin(clientId: string, message: any, ws: WebSocket) {
  const client = clients.get(clientId);
  if (!client) {
    ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
    return;
  }

  const { conversationId } = message;
  client.conversationIds.add(conversationId);

  // Notify others in the conversation
  broadcastToConversation(conversationId, {
    type: "user_joined",
    userId: client.userId,
    userType: client.userType,
    timestamp: new Date().toISOString(),
  });

  ws.send(JSON.stringify({ type: "join_success", conversationId }));
  console.log(`[WebSocket] User ${client.userId} joined conversation ${conversationId}`);
}

function handleChatMessage(clientId: string, message: any) {
  const client = clients.get(clientId);
  if (!client) return;

  const { conversationId, content } = message;

  if (!client.conversationIds.has(conversationId)) {
    client.ws.send(JSON.stringify({ type: "error", message: "Not in this conversation" }));
    return;
  }

  const chatMessage: ChatMessage = {
    conversationId,
    senderId: client.userId,
    senderType: client.userType,
    content,
    timestamp: new Date().toISOString(),
  };

  // Broadcast to all clients in this conversation
  broadcastToConversation(conversationId, {
    type: "message",
    data: chatMessage,
  });

  console.log(`[WebSocket] Message from ${client.userId} in conversation ${conversationId}`);
}

function handleLeave(clientId: string, message: any) {
  const client = clients.get(clientId);
  if (!client) return;

  const { conversationId } = message;
  client.conversationIds.delete(conversationId);

  // Notify others in the conversation
  broadcastToConversation(conversationId, {
    type: "user_left",
    userId: client.userId,
    userType: client.userType,
    timestamp: new Date().toISOString(),
  });

  console.log(`[WebSocket] User ${client.userId} left conversation ${conversationId}`);
}

function broadcastToConversation(conversationId: number, message: any) {
  const messageStr = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.conversationIds.has(conversationId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

export function getConnectedUsers(conversationId: number): Array<{ userId: number; userType: string }> {
  const users: Array<{ userId: number; userType: string }> = [];

  clients.forEach((client) => {
    if (client.conversationIds.has(conversationId)) {
      users.push({ userId: client.userId, userType: client.userType });
    }
  });

  return users;
}
