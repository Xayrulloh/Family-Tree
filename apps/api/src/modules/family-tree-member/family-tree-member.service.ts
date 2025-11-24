import {
  FamilyTreeMemberConnectionEnum,
  UserGenderEnum,
} from '@family-tree/shared';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { ConfigService } from '@nestjs/config';
import { and, eq, or } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import type { EnvType } from '~/config/env/env-validation';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type { FamilyTreeResponseDto } from '../family-tree/dto/family-tree.dto';
import type {
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
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

  // create child
  async createFamilyTreeMemberChild(
    userId: string,
    familyTreeId: string,
    body: FamilyTreeMemberCreateChildRequestDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTree = await this.getFamilyTreeById(familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    // Parent logic
    const parents =
      await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
        where: and(
          eq(
            schema.familyTreeMemberConnectionsSchema.familyTreeId,
            familyTreeId,
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

    const [child] = await this.db
      .insert(schema.familyTreeMembersSchema)
      .values({
        gender: body.gender,
        name: body.gender === UserGenderEnum.MALE ? 'Boy' : 'Girl',
        familyTreeId,
      })
      .returning();

    await Promise.all([
      await this.db.insert(schema.familyTreeMemberConnectionsSchema).values({
        familyTreeId: familyTreeId,
        fromMemberId: parents?.fromMemberId,
        toMemberId: child.id,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      }),
      await this.db.insert(schema.familyTreeMemberConnectionsSchema).values({
        familyTreeId: familyTreeId,
        fromMemberId: parents?.toMemberId,
        toMemberId: child.id,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      }),
    ]);

    return child;
  }

  // create spouse
  async createFamilyTreeMemberSpouse(
    userId: string,
    familyTreeId: string,
    body: FamilyTreeMemberCreateSpouseRequestDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTree = await this.getFamilyTreeById(familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    const partner1 = await this.getFamilyTreeMember({
      id: body.fromMemberId,
      familyTreeId,
    });

    // Spouse logic (make sure member is single)
    const memberConnections =
      await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
        where: and(
          eq(
            schema.familyTreeMemberConnectionsSchema.familyTreeId,
            familyTreeId,
          ),
          eq(
            schema.familyTreeMemberConnectionsSchema.type,
            FamilyTreeMemberConnectionEnum.SPOUSE,
          ),
          or(
            eq(
              schema.familyTreeMemberConnectionsSchema.fromMemberId,
              partner1.id,
            ),
            eq(
              schema.familyTreeMemberConnectionsSchema.toMemberId,
              partner1.id,
            ),
          ),
        ),
      });

    if (memberConnections) {
      throw new BadRequestException(
        `Family tree member with id ${body.fromMemberId} is already married`,
      );
    }

    const [spouse] = await this.db
      .insert(schema.familyTreeMembersSchema)
      .values({
        gender:
          partner1.gender === UserGenderEnum.MALE
            ? UserGenderEnum.FEMALE
            : UserGenderEnum.MALE,
        name: partner1.gender === UserGenderEnum.MALE ? 'Wife' : 'Husband',
        familyTreeId,
      })
      .returning();

    await this.db.insert(schema.familyTreeMemberConnectionsSchema).values({
      familyTreeId: familyTreeId,
      fromMemberId: partner1.id,
      toMemberId: spouse.id,
      type: FamilyTreeMemberConnectionEnum.SPOUSE,
    });

    return spouse;
  }

  // create parents
  async createFamilyTreeMemberParents(
    userId: string,
    familyTreeId: string,
    body: FamilyTreeMemberCreateParentsRequestDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const familyTree = await this.getFamilyTreeById(familyTreeId);

    if (familyTree.createdBy !== userId) {
      throw new BadRequestException(
        `Family tree with id ${familyTreeId} does not belong to user with id ${userId}`,
      );
    }

    const member = await this.getFamilyTreeMember({
      id: body.fromMemberId,
      familyTreeId,
    });

    // Parents logic (make sure member has no parents)
    // Current member parents
    const memberParents =
      await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
        where: and(
          eq(
            schema.familyTreeMemberConnectionsSchema.familyTreeId,
            familyTreeId,
          ),
          eq(
            schema.familyTreeMemberConnectionsSchema.type,
            FamilyTreeMemberConnectionEnum.PARENT,
          ),
          eq(schema.familyTreeMemberConnectionsSchema.toMemberId, member.id),
        ),
      });

    if (memberParents) {
      throw new BadRequestException(
        `Family tree member with id ${body.fromMemberId} has already parents`,
      );
    }

    // if member has spouse we should also check spouse parents
    const spouse =
      await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
        where: and(
          eq(
            schema.familyTreeMemberConnectionsSchema.familyTreeId,
            familyTreeId,
          ),
          eq(
            schema.familyTreeMemberConnectionsSchema.type,
            FamilyTreeMemberConnectionEnum.SPOUSE,
          ),
          or(
            eq(
              schema.familyTreeMemberConnectionsSchema.fromMemberId,
              member.id,
            ),
            eq(schema.familyTreeMemberConnectionsSchema.toMemberId, member.id),
          ),
        ),
      });

    if (spouse) {
      const spouseParents =
        await this.db.query.familyTreeMemberConnectionsSchema.findFirst({
          where: and(
            eq(
              schema.familyTreeMemberConnectionsSchema.familyTreeId,
              familyTreeId,
            ),
            eq(
              schema.familyTreeMemberConnectionsSchema.type,
              FamilyTreeMemberConnectionEnum.PARENT,
            ),
            or(
              eq(
                schema.familyTreeMemberConnectionsSchema.toMemberId,
                spouse.toMemberId,
              ),
              eq(
                schema.familyTreeMemberConnectionsSchema.toMemberId,
                spouse.fromMemberId,
              ),
            ),
          ),
        });

      if (spouseParents) {
        throw new BadRequestException(
          `Family tree member spouse with id ${spouse.toMemberId} has already parents`,
        );
      }
    }

    // creating parents
    const [[father], [mother]] = await Promise.all([
      this.db
        .insert(schema.familyTreeMembersSchema)
        .values({
          gender: UserGenderEnum.MALE,
          name: 'Father',
          familyTreeId,
        })
        .returning(),
      this.db
        .insert(schema.familyTreeMembersSchema)
        .values({
          gender: UserGenderEnum.FEMALE,
          name: 'Mother',
          familyTreeId,
        })
        .returning(),
    ]);

    // creating parent connection
    await this.db.insert(schema.familyTreeMemberConnectionsSchema).values([
      {
        familyTreeId: familyTreeId,
        fromMemberId: father.id,
        toMemberId: member.id,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      },
      {
        familyTreeId: familyTreeId,
        fromMemberId: mother.id,
        toMemberId: member.id,
        type: FamilyTreeMemberConnectionEnum.PARENT,
      },
      {
        familyTreeId: familyTreeId,
        fromMemberId: father.id,
        toMemberId: mother.id,
        type: FamilyTreeMemberConnectionEnum.SPOUSE,
      },
    ]);

    return member;
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
