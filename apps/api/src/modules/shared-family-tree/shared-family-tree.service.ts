import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreeUsersArrayResponseDto,
} from './dto/shared-family-tree.dto';

@Injectable()
export class SharedFamilyTreeService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
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
  }

  async getSharedFamilyTreeUsersById(
    userId: string,
    familyTreeId: string,
  ): Promise<SharedFamilyTreeUsersArrayResponseDto> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, familyTreeId),
        eq(schema.familyTreesSchema.createdBy, userId),
      ),
    });

    if (!familyTree) {
      // TODO: 403 Forbidden
      throw new BadRequestException(`You don't have a permission`);
    }

    const sharedFamilyTrees =
      await this.db.query.sharedFamilyTreesSchema.findMany({
        where: eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
        with: {
          sharedWithUser: true,
        },
      });

    return sharedFamilyTrees.map((sharedFamilyTree) => {
      return sharedFamilyTree.sharedWithUser;
    });
  }
}
