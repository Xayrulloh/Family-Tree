import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cache.get<T>(key);

      return value ?? null;
    } catch (err) {
      this.logger.error(`Redis GET failed: ${key}`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl);
    } catch (err) {
      this.logger.error(`Redis SET failed: ${key}`, err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
    } catch (err) {
      this.logger.error(`Redis DEL failed: ${key}`, err);
    }
  }

  async delMultiple(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.cache.del(key)));
    } catch (err) {
      this.logger.error(`Redis DEL failed: ${keys}`, err);
    }
  }
}
