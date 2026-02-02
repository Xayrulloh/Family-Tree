import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberGetAllResponseType,
  FamilyTreePaginationAndSearchQueryType,
  FamilyTreePaginationResponseType,
  UserResponseType,
} from '@family-tree/shared';
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

  async delByPattern(pattern: string): Promise<void> {
    try {
      const store = this.cache.stores[0];

      const client =
        // biome-ignore lint/suspicious/noExplicitAny: <I'd no choice, sry future me>
        (store as any).opts?.store?.client || (store as any).client;

      if (!client || typeof client.keys !== 'function') {
        this.logger.warn(
          'Redis client not found or does not support pattern matching',
        );

        return;
      }

      const keys: string[] = await client.keys(pattern);

      if (keys && keys.length > 0) {
        await this.cache.mdel(keys);

        this.logger.log(
          `Successfully deleted ${keys.length} keys for pattern: ${pattern}`,
        );
      }
    } catch (err) {
      this.logger.error(`Failed to delete keys by pattern: ${pattern}`, err);
    }
  }

  // User Family Trees
  async getUserFamilyTrees(
    userId: string,
    query: FamilyTreePaginationAndSearchQueryType,
  ): Promise<FamilyTreePaginationResponseType | null> {
    const key = `users:${userId}:family-trees:${JSON.stringify(query)}`;

    return this.get<FamilyTreePaginationResponseType>(key);
  }

  async setUserFamilyTrees(
    userId: string,
    query: FamilyTreePaginationAndSearchQueryType,
    data: FamilyTreePaginationResponseType,
  ): Promise<void> {
    const key = `users:${userId}:family-trees:${JSON.stringify(query)}`;

    await this.set(key, data);
  }

  async cleanUserFamilyTrees(userId: string): Promise<void> {
    await this.delByPattern(`users:${userId}:family-trees:*`);
  }

  // User Family Trees Members
  async getFamilyTreeMembers(
    treeId: string,
  ): Promise<FamilyTreeMemberGetAllResponseType | null> {
    return this.get<FamilyTreeMemberGetAllResponseType>(
      `family-trees:${treeId}:members`,
    );
  }

  async setFamilyTreeMembers(
    treeId: string,
    data: FamilyTreeMemberGetAllResponseType,
  ): Promise<void> {
    await this.set(`family-trees:${treeId}:members`, data);
  }

  async cleanFamilyTreeMembers(treeId: string): Promise<void> {
    await this.del(`family-trees:${treeId}:members`);
  }

  // User Family Trees Members Connections
  async getFamilyTreeMemberConnections(
    treeId: string,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseType | null> {
    return this.get<FamilyTreeMemberConnectionGetAllResponseType>(
      `family-trees:${treeId}:members:connections`,
    );
  }

  async setFamilyTreeMemberConnections(
    treeId: string,
    data: FamilyTreeMemberConnectionGetAllResponseType,
  ): Promise<void> {
    await this.set(`family-trees:${treeId}:members:connections`, data);
  }

  async cleanFamilyTreeMemberConnections(treeId: string): Promise<void> {
    await this.del(`family-trees:${treeId}:members:connections`);
  }

  // User
  async getUser(userId: string): Promise<UserResponseType | null> {
    return this.get<UserResponseType>(`users:${userId}`);
  }

  async setUser(userId: string, data: UserResponseType): Promise<void> {
    await this.set(`users:${userId}`, data);
  }

  async cleanUser(userId: string): Promise<void> {
    await this.del(`users:${userId}`);
  }
}
