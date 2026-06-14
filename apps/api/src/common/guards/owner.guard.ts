import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '~/database/drizzle.provider';
import * as schema from '~/database/schema';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';

/**
 * Owner-only access for routes on the bare (private) tree path. Must run after
 * `JWTAuthGuard`. Tree must exist and `createdBy` must equal the caller.
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const familyTreeId = request.params.familyTreeId ?? request.params.id;

    const familyTree = await this.db.query.familyTreesSchema.findFirst({
      where: eq(schema.familyTreesSchema.id, familyTreeId),
      columns: { createdBy: true },
    });

    if (!familyTree) {
      throw new NotFoundException(
        `Family tree with id ${familyTreeId} not found`,
      );
    }

    if (familyTree.createdBy !== request.user.id) {
      throw new ForbiddenException(`You don't have a permission`);
    }

    return true;
  }
}
