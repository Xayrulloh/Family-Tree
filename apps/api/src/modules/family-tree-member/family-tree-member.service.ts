import { FamilyTreeMemberConnectionEnum } from '@family-tree/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import type { EnvType } from '~/config/env/env-validation';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type { FamilyTreeResponseDto } from '../family-tree/dto/family-tree.dto';
import type {
  FamilyTreeMemberCreateRequestDto,
  FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberUpdateRequestDto,
} from './dto/family-tree-member.dto';

@Injectable()
export class FamilyTreeMemberService {
  protected cloudflareR2Path: string;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    protected cloudflareConfig: CloudflareConfig,
    configService: ConfigService<EnvType>,
  ) {
    this.cloudflareR2Path =
      configService.getOrThrow<EnvType['CLOUDFLARE_URL']>('CLOUDFLARE_URL');
  }

  // create member
  async createFamilyTreeMember(
    userId: string,
    familyTreeId: string,
    body: FamilyTreeMemberCreateRequestDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTree = await this.getFamilyTreeById(familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    const [familyTreeMember] = await this.db
      .insert(schema.familyTreeMembersSchema)
      .values({ ...body, familyTreeId })
      .returning();

    return familyTreeMember;
  }

  // update member
  async updateFamilyTreeMember(
    userId: string,
    param: FamilyTreeMemberGetParamDto,
    body: FamilyTreeMemberUpdateRequestDto,
  ) {
    const familyTree = await this.getFamilyTreeById(param.familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    const familyTreeMember = await this.getFamilyTreeMember(param);

    if (
      body.image &&
      familyTreeMember?.image &&
      familyTreeMember.image !== body.image
    ) {
      this.cloudflareConfig.deleteFile(familyTreeMember.image);
    }

    await this.db
      .update(schema.familyTreeMembersSchema)
      .set({
        ...body,
      })
      .where(and(eq(schema.familyTreeMembersSchema.id, param.id)));
  }

  // delete member
  async deleteFamilyTreeMember(
    userId: string,
    param: FamilyTreeMemberGetParamDto,
  ) {
    const familyTree = await this.getFamilyTreeById(param.familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // check descendants
    const descendants =
      await this.db.query.familyTreeMemberConnectionsSchema.findMany({
        where: and(
          eq(schema.familyTreeMemberConnectionsSchema.fromMemberId, param.id),
          eq(
            schema.familyTreeMemberConnectionsSchema.type,
            FamilyTreeMemberConnectionEnum.PARENT,
          ),
        ),
        limit: 5,
      });

    if (descendants.length) {
      throw new BadRequestException(
        `Family tree member with id ${param.id} has descendants`,
      );
    }

    // check he is not the last member
    const familyTreeMembers =
      await this.db.query.familyTreeMembersSchema.findMany({
        where: and(
          eq(schema.familyTreeMembersSchema.familyTreeId, param.familyTreeId),
        ),
        limit: 5,
      });

    if (familyTreeMembers.length === 1) {
      throw new BadRequestException(
        `Member with id ${param.id} is the last member of the family tree`,
      );
    }

    await this.db
      .delete(schema.familyTreeMembersSchema)
      .where(eq(schema.familyTreeMembersSchema.id, param.id));
  }

  // get all members
  async getAllFamilyTreeMembers(
    param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    return this.db.query.familyTreeMembersSchema.findMany({
      where: and(
        eq(schema.familyTreeMembersSchema.familyTreeId, param.familyTreeId),
      ),
    });
  }

  // get single member
  async getFamilyTreeMember(
    param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTreeMember =
      await this.db.query.familyTreeMembersSchema.findFirst({
        where: and(
          eq(schema.familyTreeMembersSchema.id, param.id),
          eq(schema.familyTreeMembersSchema.familyTreeId, param.familyTreeId),
        ),
      });

    if (!familyTreeMember) {
      throw new NotFoundException(
        `Family tree member with id ${param.id} not found`,
      );
    }

    return familyTreeMember;
  }

  // get family tree
  async getFamilyTreeById(
    familyTreeId: string,
  ): Promise<FamilyTreeResponseDto> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: eq(schema.familyTreesSchema.id, familyTreeId),
    });

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${familyTreeId} not found`,
      );
    }

    return familyTree;
  }
}
