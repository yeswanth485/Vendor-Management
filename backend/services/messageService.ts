export interface MessagePayload {
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

class BackendMessageService {
  private messages: MessagePayload[] = [
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

  public getMessages(): MessagePayload[] {
    return this.messages;
  }

  public sendMessage(msg: Omit<MessagePayload, 'id' | 'timestamp' | 'read'>): MessagePayload {
    const newMsg: MessagePayload = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.messages.unshift(newMsg);
    return newMsg;
  }

  public markAsRead(id: string): boolean {
    const m = this.messages.find(item => item.id === id);
    if (m) {
      m.read = true;
      return true;
    }
    return false;
  }
}

export const messageService = new BackendMessageService();
