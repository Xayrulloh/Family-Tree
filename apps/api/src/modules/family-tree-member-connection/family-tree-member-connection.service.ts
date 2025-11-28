import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
} from './dto/family-tree-member-connection.dto';

@Injectable()
export class FamilyTreeMemberConnectionService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

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
  async getFamilyTreeMemberConnections(
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
