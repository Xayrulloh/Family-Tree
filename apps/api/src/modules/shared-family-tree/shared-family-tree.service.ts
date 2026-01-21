import type { SharedFamilyTreeSchemaType } from '@family-tree/shared';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, asc, eq, ilike, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  SharedFamilyTreeCreateRequestDto,
  SharedFamilyTreePaginationAndSearchQueryDto,
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
    { page, perPage, name }: SharedFamilyTreePaginationAndSearchQueryDto,
  ): Promise<SharedFamilyTreePaginationResponseDto> {
    const offset = (page - 1) * perPage;

    const [sharedFamilyTrees, countResult] = await Promise.all([
      this.db
        .select({
          // shared family tree part
          familyTreeId: schema.sharedFamilyTreesSchema.familyTreeId,
          userId: schema.sharedFamilyTreesSchema.userId,
          canAddMembers: schema.sharedFamilyTreesSchema.canAddMembers,
          canEditMembers: schema.sharedFamilyTreesSchema.canEditMembers,
          canDeleteMembers: schema.sharedFamilyTreesSchema.canDeleteMembers,
          isBlocked: schema.sharedFamilyTreesSchema.isBlocked,

          // family tree part
          createdBy: schema.familyTreesSchema.createdBy,
          name: schema.familyTreesSchema.name,
          image: schema.familyTreesSchema.image,
          createdAt: schema.familyTreesSchema.createdAt,
          updatedAt: schema.familyTreesSchema.updatedAt,
          deletedAt: schema.familyTreesSchema.deletedAt,
        })
        .from(schema.sharedFamilyTreesSchema)
        .innerJoin(
          schema.familyTreesSchema,
          eq(
            schema.sharedFamilyTreesSchema.familyTreeId,
            schema.familyTreesSchema.id,
          ),
        )
        .where(
          and(
            eq(schema.sharedFamilyTreesSchema.userId, userId),
            eq(schema.sharedFamilyTreesSchema.isBlocked, false),
            name
              ? ilike(schema.familyTreesSchema.name, `%${name}%`)
              : undefined,
          ),
        )
        .orderBy(asc(schema.sharedFamilyTreesSchema.createdAt))
        .limit(perPage)
        .offset(offset),
      this.db
        .select({
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(schema.sharedFamilyTreesSchema)
        .innerJoin(
          schema.familyTreesSchema,
          eq(
            schema.sharedFamilyTreesSchema.familyTreeId,
            schema.familyTreesSchema.id,
          ),
        )
        .where(
          and(
            eq(schema.sharedFamilyTreesSchema.userId, userId),
            eq(schema.sharedFamilyTreesSchema.isBlocked, false),
            name
              ? ilike(schema.familyTreesSchema.name, `%${name}%`)
              : undefined,
          ),
        ),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      sharedFamilyTrees,
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
    { page, perPage, name }: SharedFamilyTreePaginationAndSearchQueryDto,
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
      this.db
        .select({
          // shared family tree part
          familyTreeId: schema.sharedFamilyTreesSchema.familyTreeId,
          userId: schema.sharedFamilyTreesSchema.userId,
          canAddMembers: schema.sharedFamilyTreesSchema.canAddMembers,
          canEditMembers: schema.sharedFamilyTreesSchema.canEditMembers,
          canDeleteMembers: schema.sharedFamilyTreesSchema.canDeleteMembers,
          isBlocked: schema.sharedFamilyTreesSchema.isBlocked,

          // user part
          email: schema.usersSchema.email,
          name: schema.usersSchema.name,
          image: schema.usersSchema.image,
          gender: schema.usersSchema.gender,
          dod: schema.usersSchema.dod,
          dob: schema.usersSchema.dob,
          description: schema.usersSchema.description,
          createdAt: schema.usersSchema.createdAt,
          updatedAt: schema.usersSchema.updatedAt,
          deletedAt: schema.usersSchema.deletedAt,
        })
        .from(schema.sharedFamilyTreesSchema)
        .innerJoin(
          schema.usersSchema,
          eq(schema.sharedFamilyTreesSchema.userId, schema.usersSchema.id),
        )
        .where(
          and(
            eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
            name ? ilike(schema.usersSchema.name, `%${name}%`) : undefined,
          ),
        )
        .orderBy(asc(schema.sharedFamilyTreesSchema.createdAt))
        .limit(perPage)
        .offset(offset),
      this.db
        .select({
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(schema.sharedFamilyTreesSchema)
        .innerJoin(
          schema.usersSchema,
          eq(schema.sharedFamilyTreesSchema.userId, schema.usersSchema.id),
        )
        .where(
          and(
            eq(schema.sharedFamilyTreesSchema.familyTreeId, familyTreeId),
            name ? ilike(schema.usersSchema.name, `%${name}%`) : undefined,
          ),
        ),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      sharedFamilyTreeUsers,
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
