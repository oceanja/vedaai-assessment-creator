import type { AssignmentStatus, GeneratedPaper, WSMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

type StatusHandler = (
  status: AssignmentStatus,
  data?: GeneratedPaper,
  error?: string
) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, StatusHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnected = false;
  private pendingSubscriptions: string[] = [];

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.isConnected = true;
      // Flush any subscriptions that were requested before connection
      this.pendingSubscriptions.forEach((id) => this.sendSubscribe(id));
      this.pendingSubscriptions = [];
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data as string);
        if (msg.type === "status_update") {
          const handler = this.handlers.get(msg.assignmentId);
          if (handler) {
            handler(msg.status, msg.data, msg.error);
          }
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      // Reconnect after 3s
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private sendSubscribe(assignmentId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({ type: "subscribe", assignmentId })
      );
    }
  }

  subscribe(assignmentId: string, handler: StatusHandler) {
    this.handlers.set(assignmentId, handler);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      this.pendingSubscriptions.push(assignmentId);
    } else {
      this.sendSubscribe(assignmentId);
    }
  }

  unsubscribe(assignmentId: string) {
    this.handlers.delete(assignmentId);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }
}

// Singleton — one WS connection for the whole app
export const wsManager = new WebSocketManager();
