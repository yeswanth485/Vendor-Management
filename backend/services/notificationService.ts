import { Response } from 'express';

export interface NotificationPayload {
  id: string;
  type: 'APPLICATION_UPDATE' | 'SECURITY_ALERT' | 'INVOICE_ALERT' | 'SLA_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionUrl?: string;
}

class BackendNotificationService {
  private clients: Set<Response> = new Set();
  private notifications: NotificationPayload[] = [
    {
      id: 'notif-1',
      type: 'SECURITY_ALERT',
      title: '72-Hour Security Bank Change Hold',
      message: 'Pacific Freight & Haulage Pty requested urgent disbursement bank account update. Dual-control verification required.',
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

  public addClient(res: Response): void {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public getNotifications(): NotificationPayload[] {
    return this.notifications;
  }

  public markAsRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public broadcast(notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>): NotificationPayload {
    const newNotif: NotificationPayload = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);

    const payload = `data: ${JSON.stringify(newNotif)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
    return newNotif;
  }
}

export const notificationService = new BackendNotificationService();
