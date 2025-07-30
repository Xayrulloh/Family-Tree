import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { and, asc, eq, ilike, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import type { EnvType } from '~/config/env/env-validation';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type {
  FamilyTreeArrayResponseDto,
  FamilyTreeCreateRequestDto,
  FamilyTreeResponseDto,
  FamilyTreeUpdateRequestDto,
} from './dto/family-tree.dto';

@Injectable()
export class FamilyTreeService {
  private cloudflareR2Path: string;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private cloudflareConfig: CloudflareConfig,
    configService: ConfigService<EnvType>,
  ) {
    this.cloudflareR2Path =
      configService.getOrThrow<EnvType['CLOUDFLARE_URL']>('CLOUDFLARE_URL');
  }

  async getFamilyTreesOfUser(
    userId: string,
  ): Promise<FamilyTreeArrayResponseDto> {
    return this.db.query.familyTreesSchema.findMany({
      where: and(
        eq(schema.familyTreesSchema.createdBy, userId),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
      orderBy: asc(schema.familyTreesSchema.createdAt),
    });
  }

  async getFamilyTreesByName(
    name: string,
  ): Promise<FamilyTreeArrayResponseDto> {
    return this.db.query.familyTreesSchema.findMany({
      where: and(
        ilike(schema.familyTreesSchema.name, `%${name}%`),
        eq(schema.familyTreesSchema.public, true),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
      limit: 5,
    });
  }

  async getFamilyTreeById(id: string): Promise<FamilyTreeResponseDto> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, id),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with id ${id} not found`);
    }

    return familyTree;
  }

  async createFamilyTree(
    userId: string,
    body: FamilyTreeCreateRequestDto,
  ): Promise<FamilyTreeResponseDto> {
    const isFamilyTreeExist = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.createdBy, userId),
        ilike(schema.familyTreesSchema.name, `%${body.name}%`),
      ),
    });

    if (isFamilyTreeExist) {
      throw new BadRequestException(
        `Family tree with name ${body.name} already exist`,
      );
    }

    if (body.image && !body.image?.includes(this.cloudflareR2Path)) {
      throw new BadRequestException('Image is not uploaded');
    }

    const [familyTree] = await this.db
      .insert(schema.familyTreesSchema)
      .values({
        createdBy: userId,
        name: body.name,
        image: body.image,
        public: body.public || false,
      })
      .returning();

    return familyTree;
  }

  async updateFamilyTree(
    userId: string,
    id: string,
    body: FamilyTreeUpdateRequestDto,
  ): Promise<void> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, id),
        eq(schema.familyTreesSchema.createdBy, userId),
        isNull(schema.familyTreesSchema.deletedAt),
      ),
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with id ${id} not found`);
    }

    if (body.image && !body.image?.includes(this.cloudflareR2Path)) {
      throw new BadRequestException('Image is not uploaded');
    }

    if (body.image && familyTree.image !== body.image && familyTree.image) {
      this.cloudflareConfig.deleteFile(familyTree.image);
    }

    await this.db
      .update(schema.familyTreesSchema)
      .set({
        name: body.name,
        image: body.image,
        public: body.public || false,
      })
      .where(eq(schema.familyTreesSchema.id, id));
  }

  async deleteFamilyTree(userId: string, id: string): Promise<void> {
    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: and(
        eq(schema.familyTreesSchema.id, id),
        eq(schema.familyTreesSchema.createdBy, userId),
      ),
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with id ${id} not found`);
    }

    if (familyTree.deletedAt) {
      await this.db
        .delete(schema.familyTreesSchema)
        .where(eq(schema.familyTreesSchema.id, id));
    } else {
      await this.db
        .update(schema.familyTreesSchema)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(schema.familyTreesSchema.id, id));
    }
  }
}
