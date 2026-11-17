// ---------------------------------------------------------------------------
// SSE-based real-time notification client
// ---------------------------------------------------------------------------

const API_BASE = (import.meta as any).env?.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:3001/api');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Notification {
  id: string;
  type:
    | 'APPLICATION_UPDATE'
    | 'SECURITY_ALERT'
    | 'INVOICE_ALERT'
    | 'SLA_ALERT'
    | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionUrl?: string;
}

export type NotificationListener = (notification: Notification) => void;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: Set<NotificationListener> = new Set();
  private notifications: Notification[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 3000; // ms

  /**
   * Open an SSE connection to the backend notification stream.
   * Automatically reconnects on error.
   */
  connect(): void {
    if (this.eventSource) return; // already connected

    try {
      this.eventSource = new EventSource(`${API_BASE}/notifications/stream`);

      this.eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.notifications.unshift(notification);
          this.listeners.forEach((fn) => fn(notification));
        } catch {
          // ignore malformed events
        }
      };

      this.eventSource.addEventListener('notification', (event: MessageEvent) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.notifications.unshift(notification);
          this.listeners.forEach((fn) => fn(notification));
        } catch {
          // ignore
        }
      });

      this.eventSource.onerror = () => {
        this.disconnect();
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  /**
   * Close the SSE connection and cancel any pending reconnect.
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Subscribe to new notifications. Returns an unsubscribe function.
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Return all cached notifications.
   */
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Mark a notification as read (local only).
   */
  markAsRead(id: string): void {
    const n = this.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  }

  /**
   * Number of unread notifications.
   */
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  /**
   * Clear all cached notifications.
   */
  clearAll(): void {
    this.notifications = [];
  }

  // ── private ────────────────────────────────────────────────────────────
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
  }
}

// Singleton for the whole app
export const notificationService = new NotificationService();
