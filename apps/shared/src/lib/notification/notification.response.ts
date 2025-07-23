import { z } from 'zod';
import { NotificationSchema } from '../schema/notification.schema';

const NotificationResponseSchema = z.object({
  unReadNotifications: NotificationSchema.array(),
  last5Notifications: NotificationSchema.array(),
});

type NotificationResponseType = z.infer<typeof NotificationResponseSchema>;

export { NotificationResponseSchema, NotificationResponseType };
