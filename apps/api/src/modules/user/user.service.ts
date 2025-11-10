import { randomUUID } from 'node:crypto';
import type { UserResponseType } from '@family-tree/shared';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <no need>
import { ConfigService } from '@nestjs/config';
import { and, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/useImportType: <no need>
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import type { EnvType } from '~/config/env/env-validation';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import { DICEBAR_URL } from '~/utils/constants';
import type { UserUpdateRequestDto } from './dto/user.dto';

@Injectable()
export class UserService {
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

  async getUserByEmail(email: string): Promise<UserResponseType> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.email, email),
        isNull(schema.usersSchema.deletedAt),
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async getUserById(id: string): Promise<UserResponseType> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.id, id),
        isNull(schema.usersSchema.deletedAt),
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async getUserThemselves(id: string): Promise<UserResponseType> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.id, id),
        isNull(schema.usersSchema.deletedAt),
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, body: UserUpdateRequestDto): Promise<void> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.id, id),
        isNull(schema.usersSchema.deletedAt),
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.gender !== body.gender) {
      // FIXME: Need to think about related family trees
    }

    if (
      user.image &&
      user.image !== body.image &&
      user.image?.includes(this.cloudflareR2Path)
    ) {
      this.cloudflareConfig.deleteFile(user.image);
    }

    await this.db
      .update(schema.usersSchema)
      .set({
        ...body,
      })
      .where(eq(schema.usersSchema.id, id));
  }

  async updateUserAvatar(id: string): Promise<UserResponseType> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.id, id),
        isNull(schema.usersSchema.deletedAt),
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (user.image?.includes(this.cloudflareR2Path)) {
      this.cloudflareConfig.deleteFile(user.image);
    }

    const [updatedUser] = await this.db
      .update(schema.usersSchema)
      .set({
        image: `${DICEBAR_URL}/7.x/notionists/svg?seed=${randomUUID()}`,
      })
      .where(eq(schema.usersSchema.id, id))
      .returning();

    return updatedUser;
  }
}
