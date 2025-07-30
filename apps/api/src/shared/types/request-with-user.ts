// shared/types/request-with-user.ts
import type { UserSchemaType } from '@family-tree/shared';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: UserSchemaType;
};
