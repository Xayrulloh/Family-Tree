import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import type { EnvType } from '~/config/env/env-validation';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  FamilyTreeMemberCreateRequestDto,
  FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
} from './dto/family-tree-member.dto';
import type {
  FamilyTreeResponseDto,
  FamilyTreeUpdateRequestDto,
} from '../family-tree/dto/family-tree.dto';

@Injectable()
export class FamilyTreeMemberService {
  private cloudflareR2Path: string;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    protected cloudflareConfig: CloudflareConfig,
    configService: ConfigService<EnvType>,
  ) {
    this.cloudflareR2Path =
      configService.getOrThrow<EnvType['CLOUDFLARE_URL']>('CLOUDFLARE_URL');
  }

  // mock member create
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

    if (body.image && !body.image?.includes(this.cloudflareR2Path)) {
      throw new BadRequestException('Image is not uploaded');
    }

    const [mockMember] = await this.db
      .insert(schema.mockMembersSchema)
      .values(body)
      .returning();

    await this.db
      .insert(schema.familyTreeMembersSchema)
      .values({
        familyTreeId,
        mockMemberId: mockMember.id,
      })
      .returning();

    return {
      mockMember,
    };
  }

  // TODO: not part of MVP
  // async bindFamilyTreeMember() {}

  // update mock member
  async updateFamilyTreeMember(
    userId: string,
    param: FamilyTreeMemberGetParamDto,
    body: FamilyTreeUpdateRequestDto,
  ) {
    const familyTree = await this.getFamilyTreeById(param.familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${param.familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    const { mockMember } = await this.getFamilyTreeMember(param);

    if (body.image && !body.image?.includes(this.cloudflareR2Path)) {
      throw new BadRequestException('Image is not uploaded');
    }

    if (body.image && mockMember?.image && mockMember.image !== body.image) {
      this.cloudflareConfig.deleteFile(mockMember.image);
    }

    await this.db
      .update(schema.mockMembersSchema)
      .set({
        ...body,
      })
      .where(
        and(
          eq(schema.mockMembersSchema.id, param.id),
          eq(schema.mockMembersSchema.familyTreeId, param.familyTreeId),
        ),
      );
  }

  // delete mock member
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

    // FIXME: also need to delete all connections

    // TODO: har delete after 30 days, but after MVP
    await this.db
      .update(schema.mockMembersSchema)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(schema.mockMembersSchema.id, param.id));
  }

  // get all mock members
  async getAllFamilyTreeMembers(
    param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    const mockMembers = await this.db.query.mockMembersSchema.findMany({
      where: and(
        eq(schema.mockMembersSchema.familyTreeId, param.familyTreeId),
        isNull(schema.mockMembersSchema.deletedAt),
      ),
    });

    // TODO: realMembers after MVP

    return mockMembers.map((mockMember) => ({
      mockMember,
    }));
  }

  // get single mock member
  async getFamilyTreeMember(
    param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const mockMember = await this.db.query.mockMembersSchema.findFirst({
      where: and(
        eq(schema.mockMembersSchema.id, param.id),
        eq(schema.mockMembersSchema.familyTreeId, param.familyTreeId),
        isNull(schema.mockMembersSchema.deletedAt),
      ),
    });

    if (!mockMember) {
      throw new NotFoundException(`Mock member with id ${param.id} not found`);
    }

    return {
      mockMember,
    };
  }

  async getFamilyTreeById(
    familyTreeId: string,
  ): Promise<FamilyTreeResponseDto> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, familyTreeId),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
    });

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${familyTreeId} not found`,
      );
    }

    return familyTree;
  }
}
