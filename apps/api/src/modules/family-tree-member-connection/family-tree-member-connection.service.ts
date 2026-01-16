import { Inject, Injectable } from '@nestjs/common';
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
}
