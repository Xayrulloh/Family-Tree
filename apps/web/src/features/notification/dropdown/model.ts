import { combine, createEffect, createEvent, createStore, sample } from 'effector';
import { notification as notificationApi } from '../../../shared/api/notification';
import { user as userApi } from '../../../shared/api/user';
import { NotificationResponseType } from '@family-tree/shared';
import { formatTimeAgo } from '../../../shared/lib/time-ago';

export const opened = createEvent();
export const markedAllAsRead = createEvent();

// Fetch notifications
export const fetchNotificationsFx = createEffect(async () => {
  const { data } = await notificationApi.findAll();
  return data;
});

// Mark all as read
export const markAllReadFx = createEffect(async () => {
  await notificationApi.read();
});

// Fetch user avatars
export const fetchUserAvatarFx = createEffect(async (userId: string): Promise<{userId: string, avatar: string}> => {
  try {
    const { data: user } = await userApi.findById(userId);
    return {
      userId,
      avatar: user.image || `https://api.dicebear.com/7.x/micah/svg?seed=${userId}`
    };
  } catch {
    return {
      userId,
      avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${userId}`
    };
  }
});

// Stores
export const $notifications = createStore<NotificationResponseType>({
  last5Notifications: [], 
  unReadNotifications: []
}).on(fetchNotificationsFx.doneData, (_, data) => data);

export const $unreadCount = $notifications.map(
  (notifications) => notifications.unReadNotifications.length
);

export const $avatars = createStore<Record<string, string>>({})
  .on(fetchUserAvatarFx.doneData, (state, { userId, avatar }) => ({
    ...state,
    [userId]: avatar
  }));

export const $displayNotifications = combine(
  $notifications,
  $avatars,
  (notifications, avatars) => {
    const combined = [
      ...notifications.unReadNotifications,
      ...notifications.last5Notifications
    ].slice(0, 5);

    return combined.map(notification => ({
      ...notification,
      senderAvatar: avatars[notification.senderUserId] || 'https://i.pravatar.cc/150',
      timeAgo: formatTimeAgo(notification.createdAt),
      isUnread: notifications.unReadNotifications.some(n => n.id === notification.id)
    }));
  }
);

export const $showViewAll = $notifications.map((notifications) => {
  return notifications.unReadNotifications.length > 5 || 
         notifications.last5Notifications.length > 5 ||
         (notifications.unReadNotifications.length + notifications.last5Notifications.length) > 5;
});

// Automatically fetch avatars for new notifications
sample({
  clock: fetchNotificationsFx.doneData,
  source: $avatars,
  fn: (avatars, data) => {
    const allNotifications = [...data.unReadNotifications, ...data.last5Notifications];
    const userIdsToFetch = Array.from(new Set(allNotifications.map(n => n.senderUserId)))
      .filter(userId => !avatars[userId]);
    return userIdsToFetch;
  },
}).watch(userIds => {
  userIds.forEach(userId => fetchUserAvatarFx(userId));
});

// Samples for notification flow
sample({
  clock: opened,
  target: fetchNotificationsFx,
});

sample({
  clock: markedAllAsRead,
  target: markAllReadFx,
});

sample({
  clock: markAllReadFx.done,
  target: fetchNotificationsFx,
});

// Initial fetch and periodic refresh
opened();
setInterval(() => opened(), 60000);