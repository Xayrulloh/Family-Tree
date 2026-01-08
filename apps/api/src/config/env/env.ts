import { registerAs } from '@nestjs/config';
import { envSchema } from './env-validation';

export const env = registerAs('env', () => {
  const parsed = envSchema.parse(process.env);

  return parsed;
});

export const checkedEnv = env();
