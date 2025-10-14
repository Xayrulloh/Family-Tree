import type { z } from 'zod';
import { RealUserSchema } from '../schema/real-user.schema';

const RealUserResponseSchema = RealUserSchema;

type RealUserResponseType = z.infer<typeof RealUserResponseSchema>;

export { RealUserResponseSchema, type RealUserResponseType };
