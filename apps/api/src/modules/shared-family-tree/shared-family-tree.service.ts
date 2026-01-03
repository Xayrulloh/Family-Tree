import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CacheService } from '~/config/cache/cache.service';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeCreateRequestDto,
} from './dto/shared-family-tree.dto';

@Injectable()
export class SharedFamilyTreeService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private readonly cacheService: CacheService,
    // we need cache
  ) {}

  async getSharedFamilyTreesOfUser(
    userId: string,
  ): Promise<SharedFamilyTreeArrayResponseDto> {
    const sharedFamilyTrees =
      await this.db.query.sharedFamilyTreesSchema.findMany({
        where: eq(schema.sharedFamilyTreesSchema.sharedWithUserId, userId),
        orderBy: asc(schema.sharedFamilyTreesSchema.createdAt),
        with: {
          familyTree: true,
        },
      });

    return sharedFamilyTrees.map((sharedFamilyTree) => {
      return sharedFamilyTree.familyTree;
    });
  }

  async createSharedFamilyTree(
    body: SharedFamilyTreeCreateRequestDto,
  ): Promise<void> {
    const isFamilyTreeExist = await this.db.query.familyTreesSchema.findFirst({
      where: and(eq(schema.familyTreesSchema.id, body.familyTreeId)),
    });

    if (!isFamilyTreeExist) {
      throw new BadRequestException(
        `Family tree with id ${body.familyTreeId} not found`,
      );
    }

    const isSharedFamilyTreeExist =
      await this.db.query.sharedFamilyTreesSchema.findFirst({
        where: and(
          eq(schema.sharedFamilyTreesSchema.familyTreeId, body.familyTreeId),
          eq(
            schema.sharedFamilyTreesSchema.sharedWithUserId,
            body.sharedWithUserId,
          ),
        ),
      });

    if (isSharedFamilyTreeExist) {
      return;
    }

    await this.db.insert(schema.sharedFamilyTreesSchema).values({
      familyTreeId: body.familyTreeId,
      sharedWithUserId: body.sharedWithUserId,
    });

    // clear cache
    await this.cacheService.del(
      `users:${body.sharedWithUserId}:shared-family-trees`,
    );
  }
}
