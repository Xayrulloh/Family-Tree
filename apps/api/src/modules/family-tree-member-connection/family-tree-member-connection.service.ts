import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
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
import { FamilyTreeMemberConnectionEnum } from '@family-tree/shared';

@Injectable()
export class FamilyTreeMemberConnectionService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // create connection
  async createFamilyTreeMemberConnection(
    userId: string,
    param: FamilyTreeMemberConnectionGetAllParamDto,
    body: FamilyTreeMemberConnectionCreateRequestDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    const { familyTree } = await this.getFamilyTreeMembers(
      body.fromMemberId,
      body.toMemberId,
      param.familyTreeId,
    );

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // Parent logic
    if (FamilyTreeMemberConnectionEnum.PARENT === body.type) {
      const parents =
        await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
          where: and(
            eq(
              schema.familyTreeMemberConnectionsSchema.familyTreeId,
              param.familyTreeId,
            ),
            eq(
              schema.familyTreeMemberConnectionsSchema.type,
              FamilyTreeMemberConnectionEnum.SPOUSE,
            ),
            or(
              eq(
                schema.familyTreeMemberConnectionsSchema.fromMemberId,
                body.fromMemberId,
              ),
              eq(
                schema.familyTreeMemberConnectionsSchema.toMemberId,
                body.fromMemberId,
              ),
            ),
          ),
        });

      if (!parents) {
        throw new BadRequestException(
          `Family tree member with id ${body.fromMemberId} has no spouse`,
        );
      }

      const connection = await this.db
        .insert(schema.familyTreeMemberConnectionsSchema)
        .values({
          familyTreeId: param.familyTreeId,
          fromMemberId: parents?.fromMemberId,
          toMemberId: body.toMemberId,
          type: FamilyTreeMemberConnectionEnum.PARENT,
        })
        .returning();

      await this.db.insert(schema.familyTreeMemberConnectionsSchema).values({
        familyTreeId: param.familyTreeId,
        fromMemberId: parents?.toMemberId,
        toMemberId: body.toMemberId,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      });

      return connection;
    }

    const connection = await this.db
      .insert(schema.familyTreeMemberConnectionsSchema)
      .values({
        familyTreeId: param.familyTreeId,
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
      body.fromMemberId,
      body.toMemberId,
      param.familyTreeId,
    );

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // FIXME: check fromMemberId connections

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
      where: eq(schema.familyTreesSchema.id, param.familyTreeId),
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
          schema.familyTreeMemberConnectionsSchema.fromMemberId,
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
    const [fromFamilyTreeMember, toFamilyTreeMember, familyTree] =
      await Promise.all([
        this.db.query.familyTreeMembersSchema.findFirst({
          where: and(
            eq(schema.familyTreeMembersSchema.id, fromMemberId),
            eq(schema.familyTreeMembersSchema.familyTreeId, familyTreeId),
          ),
        }),
        this.db.query.familyTreeMembersSchema.findFirst({
          where: and(
            eq(schema.familyTreeMembersSchema.id, toMemberId),
            eq(schema.familyTreeMembersSchema.familyTreeId, familyTreeId),
          ),
        }),
        this.db.query.familyTreesSchema.findFirst({
          where: eq(schema.familyTreesSchema.id, familyTreeId),
        }),
      ]);

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${familyTreeId} not found`,
      );
    }

    if (!fromFamilyTreeMember) {
      throw new NotFoundException(
        `Family Tree Member "from member" with id ${fromMemberId} not found`,
      );
    }

    if (!toFamilyTreeMember) {
      throw new NotFoundException(
        `Family Tree Member "to member" with id ${toMemberId} not found`,
      );
    }

    return {
      fromMember: fromFamilyTreeMember,
      toMember: toFamilyTreeMember,
      familyTree,
    };
  }
}
