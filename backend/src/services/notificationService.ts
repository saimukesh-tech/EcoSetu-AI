export interface AppNotification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

const notificationStore: AppNotification[] = [
  {
    id: 'notif_1',
    uid: 'demo_organizer_123',
    title: 'Pickup Request Accepted',
    message: 'Vijayawada EcoRecycle Unit accepted your pickup request for 438 kg waste.',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_2',
    uid: 'demo_organizer_123',
    title: 'Waste Prediction Generated',
    message: 'AI Random Forest model forecasted 438 kg total waste generation for Ganesh Festival 2026.',
    type: 'INFO',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export function sendNotification(
  uid: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO'
): AppNotification {
  const notif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uid,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };

  notificationStore.unshift(notif);
  return notif;
}

export function getUserNotifications(uid: string): AppNotification[] {
  return notificationStore.filter(n => n.uid === uid || uid === 'demo_admin_789');
}

export function markNotificationAsRead(notifId: string): boolean {
  const notif = notificationStore.find(n => n.id === notifId);
  if (!notif) return false;
  notif.read = true;
  return true;
}
