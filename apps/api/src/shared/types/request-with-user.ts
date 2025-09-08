import type { RealUserSchemaType } from '@family-tree/shared';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: RealUserSchemaType;
};
