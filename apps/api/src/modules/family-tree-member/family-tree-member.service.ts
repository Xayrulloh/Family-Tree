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

    const [member] = await this.db
      .insert(schema.membersSchema)
      .values({ ...body, familyTreeId })
      .returning();

    await this.db
      .insert(schema.familyTreeMembersSchema)
      .values({
        familyTreeId,
        memberId: member.id,
      })
      .returning();

    return {
      member,
    };
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

    const { member } = await this.getFamilyTreeMember(param);

    if (body.image && member?.image && member.image !== body.image) {
      this.cloudflareConfig.deleteFile(member.image);
    }

    await this.db
      .update(schema.membersSchema)
      .set({
        ...body,
      })
      .where(and(eq(schema.membersSchema.id, param.id)));
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

    await this.db
      .delete(schema.membersSchema)
      .where(eq(schema.membersSchema.id, param.id));
  }

  // get all members
  async getAllFamilyTreeMembers(
    param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    const familyTreeMembers =
      await this.db.query.familyTreeMembersSchema.findMany({
        where: and(
          eq(schema.familyTreeMembersSchema.familyTreeId, param.familyTreeId),
        ),
        with: {
          member: true,
        },
      });

    return familyTreeMembers.map((familyTreeMember) => ({
      member: familyTreeMember.member,
    }));
  }

  // get single member
  async getFamilyTreeMember(
    param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTreeMember =
      await this.db.query.familyTreeMembersSchema.findFirst({
        where: and(
          eq(schema.familyTreeMembersSchema.memberId, param.id),
          eq(schema.familyTreeMembersSchema.familyTreeId, param.familyTreeId),
        ),
        with: {
          member: true,
        },
      });

    if (!familyTreeMember?.member) {
      throw new NotFoundException(
        `member member with id ${param.id} not found`,
      );
    }

    return {
      member: familyTreeMember.member,
    };
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
