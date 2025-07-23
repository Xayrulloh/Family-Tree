import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as schema from '~/database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import { UserResponseType } from '@family-tree/shared';
import { and, eq, isNull } from 'drizzle-orm';
import { UserUpdateRequestDto } from './dto/user.dto';
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import { EnvType } from '~/config/env/env-validation';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private cloudflareR2Path: string;

  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
    private cloudflareConfig: CloudflareConfig,
    private configService: ConfigService<EnvType>
  ) {
    this.cloudflareR2Path =
      configService.getOrThrow<EnvType['CLOUDFLARE_URL']>('CLOUDFLARE_URL');
  }

  async getUserByEmail(email: string): Promise<UserResponseType> {
    const user = await this.db.query.usersSchema.findFirst({
      where: and(
        eq(schema.usersSchema.email, email),
        isNull(schema.usersSchema.deletedAt)
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
        isNull(schema.usersSchema.deletedAt)
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
        isNull(schema.usersSchema.deletedAt)
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
        isNull(schema.usersSchema.deletedAt)
      ),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (!user.image?.includes(this.cloudflareR2Path)) {
      throw new BadRequestException('Image is not uploaded');
    }

    if (user.gender !== body.gender) {
      // FIXME: Need to think about related family trees
    }

    if (user.image && user.image !== body.image) {
      this.cloudflareConfig.deleteFile(user.image);
    }

    await this.db
      .update(schema.usersSchema)
      .set({
        ...body,
      })
      .where(eq(schema.usersSchema.id, id));
  }
}
