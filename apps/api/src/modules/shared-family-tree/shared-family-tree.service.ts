import type { SharedFamilyTreeSchemaType } from '@family-tree/shared';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, asc, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreePaginationQueryDto,
  SharedFamilyTreePaginationResponseDto,
  SharedFamilyTreeResponseDto,
  SharedFamilyTreeUpdateRequestDto,
  SharedFamilyTreeUsersPaginationResponseDto,
} from './dto/shared-family-tree.dto';

@Injectable()
export class SharedFamilyTreeService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async getSharedFamilyTrees(
    userId: string,
    { page, perPage }: SharedFamilyTreePaginationQueryDto,
  ): Promise<SharedFamilyTreePaginationResponseDto> {
    const offset = (page - 1) * perPage;

    const [sharedFamilyTrees, countResult] = await Promise.all([
      this.db.query.sharedFamilyTreesSchema.findMany({
        where: and(
          eq(schema.sharedFamilyTreesSchema.userId, userId),
          eq(schema.sharedFamilyTreesSchema.isBlocked, false),
        ),
        orderBy: asc(schema.sharedFamilyTreesSchema.createdAt),
        with: {
          familyTree: true,
        },
        columns: {
          familyTreeId: true,
          userId: true,
          canAddMembers: true,
          canEditMembers: true,
          canDeleteMembers: true,
          isBlocked: true,
        },
        limit: perPage,
        offset,
      }),
      this.db
        .select({
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(schema.sharedFamilyTreesSchema)
        .where(
          and(
            eq(schema.sharedFamilyTreesSchema.userId, userId),
            eq(schema.sharedFamilyTreesSchema.isBlocked, false),
          ),
        ),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      sharedFamilyTrees: sharedFamilyTrees.map((sharedFamilyTree) => {
        return {
          ...sharedFamilyTree,
          ...sharedFamilyTree.familyTree,
        };
      }),
      page,
      perPage,
      totalCount,
      totalPages,
    };
  }

  async getSharedFamilyTreeById(
    userId: string,
    familyTreeId: string,
  ): Promise<SharedFamilyTreeResponseDto> {
    const sharedFamilyTree =
      await this.db.query.sharedFamilyTreesSchema.findFirst({
        where: and(
          eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
          eq(schema.sharedFamilyTreesSchema.userId, userId),
        ),
        with: {
          familyTree: true,
        },
        columns: {
          familyTreeId: true,
          userId: true,
          canAddMembers: true,
          canEditMembers: true,
          canDeleteMembers: true,
          isBlocked: true,
        },
      });

    if (sharedFamilyTree?.isBlocked) {
      throw new ForbiddenException(`You don't have a permission`);
    }

    if (!sharedFamilyTree) {
      await this.createSharedFamilyTree({
        familyTreeId,
        userId: userId,
      });

      return this.getSharedFamilyTreeById(userId, familyTreeId);
    }

    return {
      ...sharedFamilyTree,
      ...sharedFamilyTree.familyTree,
    };
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

    await this.db.insert(schema.sharedFamilyTreesSchema).values({
      familyTreeId: body.familyTreeId,
      userId: body.userId,
    });
  }

  async getSharedFamilyTreeUsersById(
    userId: string,
    familyTreeId: string,
    { page, perPage }: SharedFamilyTreePaginationQueryDto,
  ): Promise<SharedFamilyTreeUsersPaginationResponseDto> {
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

    const offset = (page - 1) * perPage;

    const [sharedFamilyTreeUsers, countResult] = await Promise.all([
      this.db.query.sharedFamilyTreesSchema.findMany({
        where: eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
        with: {
          sharedWithUser: true,
        },
        columns: {
          userId: true,
          familyTreeId: true,
          canAddMembers: true,
          canEditMembers: true,
          canDeleteMembers: true,
          isBlocked: true,
        },
        limit: perPage,
        offset,
      }),
      this.db
        .select({
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(schema.sharedFamilyTreesSchema)
        .where(eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId)),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      sharedFamilyTreeUsers: sharedFamilyTreeUsers.map((sharedFamilyTree) => {
        return {
          ...sharedFamilyTree.sharedWithUser,
          ...sharedFamilyTree,
        };
      }),
      page,
      perPage,
      totalCount,
      totalPages,
    };
  }

  async checkAccessSharedFamilyTree(
    userId: string,
    familyTreeId: string,
    access?: Partial<
      Pick<
        SharedFamilyTreeSchemaType,
        'canAddMembers' | 'canEditMembers' | 'canDeleteMembers'
      >
    >,
  ): Promise<void> {
    const isOwner = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, familyTreeId),
        eq(schema.familyTreesSchema.createdBy, userId),
      ),
    });

    if (isOwner) {
      return;
    }

    const sharedFamilyTreeUserAccess =
      await this.db.query.sharedFamilyTreesSchema.findFirst({
        where: and(
          eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
          eq(schema.sharedFamilyTreesSchema.userId, userId),
        ),
        columns: {
          canAddMembers: true,
          canEditMembers: true,
          canDeleteMembers: true,
          isBlocked: true,
        },
      });

    if (!sharedFamilyTreeUserAccess || sharedFamilyTreeUserAccess.isBlocked) {
      throw new ForbiddenException(`You don't have a permission`);
    }

    if (access?.canAddMembers && !sharedFamilyTreeUserAccess.canAddMembers) {
      throw new ForbiddenException(`You don't have a permission`);
    }

    if (access?.canEditMembers && !sharedFamilyTreeUserAccess.canEditMembers) {
      throw new ForbiddenException(`You don't have a permission`);
    }

    if (
      access?.canDeleteMembers &&
      !sharedFamilyTreeUserAccess.canDeleteMembers
    ) {
      throw new ForbiddenException(`You don't have a permission`);
    }
  }

  async updateSharedFamilyTreeById(
    userId: string,
    familyTreeId: string,
    body: SharedFamilyTreeUpdateRequestDto,
  ): Promise<void> {
    await this.db
      .update(schema.sharedFamilyTreesSchema)
      .set(body)
      .where(
        and(
          eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
          eq(schema.sharedFamilyTreesSchema.userId, userId),
        ),
      );
  }
}
