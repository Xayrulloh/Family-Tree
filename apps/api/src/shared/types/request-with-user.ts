// shared/types/request-with-user.ts
import { UserSchemaType } from '@family-tree/shared';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: UserSchemaType;
};
