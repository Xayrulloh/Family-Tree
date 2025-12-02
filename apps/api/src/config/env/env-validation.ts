import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().length(4).transform(Number),
  NODE_ENV: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  COOKIES_SECRET: z.string().min(1),
  CLOUDFLARE_URL: z.string().url(),
  CLOUDFLARE_ENDPOINT: z.string().url(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
  SENTRY_DSN: z.string().min(1),
  REDIS_URL: z.string().url(),
  REDIS_TTL: z.string().min(4).transform(Number),
});

type EnvType = z.infer<typeof envSchema>;

function validateEnv() {
  return envSchema.parse(process.env);
}

export { type EnvType, validateEnv, envSchema };
