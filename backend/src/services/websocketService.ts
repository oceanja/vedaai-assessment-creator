import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { AssignmentStatus, GeneratedPaper, WSStatusUpdateMessage } from "../types";

// Maps assignmentId → Set of connected WebSocket clients
const subscriptions = new Map<string, Set<WebSocket>>();

export function setupWebSocketServer(wss: WebSocketServer) {
  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    let subscribedIds: string[] = [];

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "subscribe" && typeof msg.assignmentId === "string") {
          const id: string = msg.assignmentId;
          subscribedIds.push(id);

          if (!subscriptions.has(id)) {
            subscriptions.set(id, new Set());
          }
          subscriptions.get(id)!.add(ws);
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      // Clean up all subscriptions for this client
      subscribedIds.forEach((id) => {
        const clients = subscriptions.get(id);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) subscriptions.delete(id);
        }
      });
      subscribedIds = [];
    });
  });
}

export function notifyAssignmentUpdate(
  assignmentId: string,
  status: AssignmentStatus,
  data?: GeneratedPaper,
  error?: string
) {
  const clients = subscriptions.get(assignmentId);
  if (!clients || clients.size === 0) return;

  const message: WSStatusUpdateMessage = {
    type: "status_update",
    assignmentId,
    status,
    ...(data ? { data } : {}),
    ...(error ? { error } : {}),
  };

  const payload = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error("[WS] Failed to send message:", err);
      }
    }
  });
}
