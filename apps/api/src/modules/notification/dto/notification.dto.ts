import { NotificationResponseSchema } from '@family-tree/shared';
import { createZodDto } from 'nestjs-zod';

// response
class NotificationResponseDto extends createZodDto(
  NotificationResponseSchema
) {}

export { NotificationResponseDto };
