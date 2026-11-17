export interface AppMessage {
  id: string;
  type: 'SYSTEM' | 'ALERT' | 'INFO' | 'ACTION_REQUIRED';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  sender: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionUrl?: string;
  applicationId?: string;
}

type MessageListener = (messages: AppMessage[]) => void;

class ClientMessageService {
  private listeners: Set<MessageListener> = new Set();
  private messages: AppMessage[] = [
    {
      id: 'msg-1',
      type: 'ACTION_REQUIRED',
      title: 'Mandatory Re-verification of Tax ID',
      body: 'Please request the updated VAT/GST registration certificate from the supplier. Format discrepancy noted under RULE-003.',
      timestamp: new Date().toISOString(),
      read: false,
      sender: 'Marcus Vance (Approver)',
      priority: 'HIGH',
      applicationId: 'VND-2026-1002',
    },
    {
      id: 'msg-2',
      type: 'INFO',
      title: 'Monthly Procurement SLA Performance',
      body: 'All suppliers maintained a composite delivery score above 98.2% across European and Pacific territories.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      sender: 'System Intelligence',
      priority: 'LOW',
    },
    {
      id: 'msg-3',
      type: 'ALERT',
      title: 'Bank Change Security Lockout Active',
      body: 'Verbal telephone callback is pending completion with Pacific Freight chief financial officer.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: false,
      sender: 'Security Operations',
      priority: 'CRITICAL',
    }
  ];

  constructor() {
    this.fetchRemote();
  }

  private getApiUrl(endpoint: string): string {
    const apiBase = (import.meta as any).env?.VITE_API_URL || 
      (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:3001/api');
    return `${apiBase}${endpoint}`;
  }

  private async fetchRemote() {
    try {
      const res = await fetch(this.getApiUrl('/messages'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.messages = data;
          this.notify();
        }
      }
    } catch {
      // Offline fallback
    }
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    listener([...this.messages]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const copy = [...this.messages];
    for (const listener of this.listeners) {
      listener(copy);
    }
  }

  public getMessages(): AppMessage[] {
    return [...this.messages];
  }

  public getUnreadCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  public async sendMessage(msg: Omit<AppMessage, 'id' | 'timestamp' | 'read'>): Promise<AppMessage> {
    const newMsg: AppMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.messages.unshift(newMsg);
    this.notify();

    try {
      await fetch(this.getApiUrl('/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch {
      // Local fallback
    }

    return newMsg;
  }

  public async markAsRead(id: string): Promise<void> {
    const item = this.messages.find(m => m.id === id);
    if (item) {
      item.read = true;
      this.notify();
    }
    try {
      await fetch(this.getApiUrl(`/messages/${id}/read`), { method: 'PUT' });
    } catch {
      // Local fallback
    }
  }
}

export const messageService = new ClientMessageService();
