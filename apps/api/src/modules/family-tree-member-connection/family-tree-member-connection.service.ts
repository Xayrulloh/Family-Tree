import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  FamilyTreeMemberConnectionCreateRequestDto,
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
  FamilyTreeMemberConnectionGetParamDto,
  FamilyTreeMemberConnectionUpdateRequestDto,
} from './dto/family-tree-member-connection.dto';

@Injectable()
export class FamilyTreeMemberConnectionService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // create connection
  async createFamilyTreeMemberConnection(
    userId: string,
    { familyTreeId }: FamilyTreeMemberConnectionGetAllParamDto,
    body: FamilyTreeMemberConnectionCreateRequestDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    const { familyTree } = await this.getFamilyTreeMembers(
      body.fromUserId,
      body.toUserId,
      familyTreeId,
    );

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // FIXME: check fromUserId connections

    const connection = await this.db
      .insert(schema.familyTreeMemberConnectionsSchema)
      .values({
        familyTreeId,
        ...body,
      })
      .returning();

    return connection;
  }

  // update connection
  async updateFamilyTreeMemberConnection(
    userId: string,
    param: FamilyTreeMemberConnectionGetParamDto,
    body: FamilyTreeMemberConnectionUpdateRequestDto,
  ) {
    const { familyTree } = await this.getFamilyTreeMembers(
      body.fromUserId,
      body.toUserId,
      param.familyTreeId,
    );

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // FIXME: check fromUserId connections

    await this.db
      .update(schema.familyTreeMemberConnectionsSchema)
      .set(body)
      .where(eq(schema.familyTreeMemberConnectionsSchema.id, param.id));
  }

  // delete connection
  async deleteFamilyTreeMemberConnection(
    userId: string,
    param: FamilyTreeMemberConnectionGetParamDto,
  ) {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, param.familyTreeId),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
    });

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${param.familyTreeId} not found`,
      );
    }

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    await this.db
      .delete(schema.familyTreeMemberConnectionsSchema)
      .where(eq(schema.familyTreeMemberConnectionsSchema.id, param.id));
  }

  // get all connections in tree
  async getAllFamilyTreeMemberConnections(
    param: FamilyTreeMemberConnectionGetAllParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.db.query.familyTreeMemberConnectionsSchema.findMany({
      where: eq(
        schema.familyTreeMemberConnectionsSchema.familyTreeId,
        param.familyTreeId,
      ),
    });
  }

  // get member connections
  async getFamilyTreeMemberConnection(
    param: FamilyTreeMemberConnectionGetByMemberParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.db.query.familyTreeMemberConnectionsSchema.findMany({
      where: and(
        eq(
          schema.familyTreeMemberConnectionsSchema.fromUserId,
          param.memberUserId,
        ),
        eq(
          schema.familyTreeMemberConnectionsSchema.familyTreeId,
          param.familyTreeId,
        ),
      ),
    });
  }

  // get fromMember, toMember and family Tree after checking
  async getFamilyTreeMembers(
    fromMemberId: string,
    toMemberId: string,
    familyTreeId: string,
  ) {
    const [fromMember, toMember, familyTree] = await Promise.all([
      this.db.query.mockMembersSchema.findFirst({
        where: and(
          eq(schema.mockMembersSchema.id, fromMemberId),
          eq(schema.mockMembersSchema.familyTreeId, familyTreeId),
          isNull(schema.mockMembersSchema.deletedAt),
        ),
      }),
      this.db.query.mockMembersSchema.findFirst({
        where: and(
          eq(schema.mockMembersSchema.id, toMemberId),
          eq(schema.mockMembersSchema.familyTreeId, familyTreeId),
          isNull(schema.mockMembersSchema.deletedAt),
        ),
      }),
      this.db.query.familyTreesSchema.findFirst({
        where: and(
          eq(schema.familyTreesSchema.id, familyTreeId),
          isNull(schema.familyTreesSchema.deletedAt),
        ),
      }),
    ]);

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${familyTreeId} not found`,
      );
    }

    if (!fromMember) {
      throw new NotFoundException(
        `Mock "from member" with id ${fromMemberId} not found`,
      );
    }

    if (!toMember) {
      throw new NotFoundException(
        `Mock "to member" with id ${toMemberId} not found`,
      );
    }

    return {
      fromMember,
      toMember,
      familyTree,
    };
  }
}
