import * as z from 'zod';
import { BaseSchema } from './base.schema';

const NotificationSchema = z
  .object({
    content: z.string().min(5),
    receiverUserId: z.string().uuid(),
    senderUserId: z.string().uuid(),
  })
  .merge(BaseSchema);

type NotificationSchemaType = z.infer<typeof NotificationSchema>;

export { NotificationSchema, NotificationSchemaType };
