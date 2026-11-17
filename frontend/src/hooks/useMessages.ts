import { useState, useEffect } from 'react';
import { messageService, AppMessage } from '../services/messageService';

export function useMessages() {
  const [messages, setMessages] = useState<AppMessage[]>(() => messageService.getMessages());
  const [unreadCount, setUnreadCount] = useState<number>(() => messageService.getUnreadCount());

  useEffect(() => {
    return messageService.subscribe((list) => {
      setMessages(list);
      setUnreadCount(list.filter(m => !m.read).length);
    });
  }, []);

  const sendMessage = async (msg: Omit<AppMessage, 'id' | 'timestamp' | 'read'>) => {
    return await messageService.sendMessage(msg);
  };

  const markAsRead = async (id: string) => {
    await messageService.markAsRead(id);
  };

  return {
    messages,
    unreadCount,
    sendMessage,
    markAsRead,
  };
}
