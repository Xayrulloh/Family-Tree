import * as z from 'zod';
import { BaseSchema } from './base.schema';

const NotificationSchema = z
  .object({
    content: z.string().min(5).describe('The content of the notification'),
    receiverUserId: z.string().uuid().describe('The user id of the receiver'),
    senderUserId: z.string().uuid().describe('The user id of the sender'),
  })
  .merge(BaseSchema)
  .describe('Notification');

type NotificationSchemaType = z.infer<typeof NotificationSchema>;

export { NotificationSchema, type NotificationSchemaType };
