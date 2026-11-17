import { useState, useEffect } from 'react';
import { notificationService, AppNotification } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => notificationService.getNotifications());
  const [unreadCount, setUnreadCount] = useState<number>(() => notificationService.getUnreadCount());

  useEffect(() => {
    return notificationService.subscribe((list) => {
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    });
  }, []);

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    notificationService.addLocalNotification(notif);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
  };
}
