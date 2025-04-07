import { NotificationSchema } from '../schema/notification.schema';

const NotificationCreateRequestSchema = NotificationSchema.pick({
  content: true,
  receiverUserId: true,
  senderUserId: true,
});

export { NotificationCreateRequestSchema };
