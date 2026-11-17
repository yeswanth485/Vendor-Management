export interface AppNotification {
  id: string;
  type: 'APPLICATION_UPDATE' | 'SECURITY_ALERT' | 'INVOICE_ALERT' | 'SLA_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionUrl?: string;
}

type NotificationListener = (notifications: AppNotification[]) => void;

class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: Set<NotificationListener> = new Set();
  private notifications: AppNotification[] = [
    {
      id: 'notif-1',
      type: 'SECURITY_ALERT',
      title: '72-Hour Security Bank Change Hold',
      message: 'Pacific Freight & Haulage Pty requested urgent disbursement account update. Verification pending.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'CRITICAL',
      actionUrl: '/risk_exceptions',
    },
    {
      id: 'notif-2',
      type: 'APPLICATION_UPDATE',
      title: 'New Vendor Filing Received',
      message: 'Apex Industrial Supplies Pvt Ltd submitted registration. RULE-006 token similarity flagged.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      priority: 'MEDIUM',
      actionUrl: '/applications',
    },
    {
      id: 'notif-3',
      type: 'INVOICE_ALERT',
      title: '3-Way Match Price Discrepancy',
      message: 'Invoice #INV-2026-9281 exceeds purchase order tolerance limit by 6.5%.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      priority: 'HIGH',
      actionUrl: '/invoices_ap',
    }
  ];

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (typeof window === 'undefined') return;

    try {
      const apiBase = (import.meta as any).env?.VITE_API_URL || 
        (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:3001/api');
      const sseUrl = `${apiBase}/notifications/stream`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onmessage = (event) => {
        try {
          const newNotif = JSON.parse(event.data) as AppNotification;
          this.notifications.unshift(newNotif);
          this.notify();
        } catch (e) {
          console.warn('[SSE] Failed to parse message', e);
        }
      };

      this.eventSource.onerror = () => {
        // SSE disconnected or offline - clean close, will reconnect later
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        setTimeout(() => this.connect(), 15000);
      };
    } catch {
      // Offline fallback
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener([...this.notifications]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const copy = [...this.notifications];
    for (const listener of this.listeners) {
      listener(copy);
    }
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(id: string): void {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.notify();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => { n.read = true; });
    this.notify();
  }

  public clearAll(): void {
    this.notifications = [];
    this.notify();
  }

  public addLocalNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    this.notifications.unshift({
      ...notif,
      id: `local-notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
    this.notify();
  }
}

export const notificationService = new NotificationService();
