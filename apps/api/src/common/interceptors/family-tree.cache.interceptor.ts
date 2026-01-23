import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberGetAllResponseType,
  FamilyTreePaginationResponseType,
} from '@family-tree/shared';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type Observable, of, tap } from 'rxjs';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CacheService } from '../../config/cache/cache.service';

@Injectable()
export class FamilyTreeCacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    const { method, user, query, params } = request;
    const treeId = params.familyTreeId || params.id;
    const path = request.route?.path || request.path || '';

    if (!user) return next.handle();

    // GET requests - Check Cache
    if (method === 'GET') {
      // /family-trees
      if (path === '/api/family-trees') {
        const cached = await this.cacheService.getUserFamilyTrees(
          user.id,
          query,
        );

        if (cached) return of(cached);
      }

      // /family-trees/:familyTreeId/members
      if (path === '/api/family-trees/:familyTreeId/members') {
        if (treeId) {
          const cached = await this.cacheService.getFamilyTreeMembers(treeId);

          if (cached) return of(cached);
        }
      }

      // /family-trees/:familyTreeId/members/connections
      if (path === '/api/family-trees/:familyTreeId/members/connections') {
        if (treeId) {
          const cached =
            await this.cacheService.getFamilyTreeMemberConnections(treeId);

          if (cached) return of(cached);
        }
      }

      return next.handle().pipe(
        tap(async (data) => {
          switch (path) {
            case '/api/family-trees': {
              await this.cacheService.setUserFamilyTrees(
                user.id,
                query,
                data as FamilyTreePaginationResponseType,
              );

              break;
            }
            case '/api/family-trees/:familyTreeId/members': {
              if (treeId) {
                await this.cacheService.setFamilyTreeMembers(
                  treeId,
                  data as FamilyTreeMemberGetAllResponseType,
                );
              }

              break;
            }
            case '/api/family-trees/:familyTreeId/members/connections': {
              if (treeId) {
                await this.cacheService.setFamilyTreeMemberConnections(
                  treeId,
                  data as FamilyTreeMemberConnectionGetAllResponseType,
                );
              }

              break;
            }
            default: {
              break;
            }
          }
        }),
      );
    }

    // Mutation requests - Invalidate Cache
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    if (isMutation) {
      return next.handle().pipe(
        tap(async () => {
          const isMemberMutation = path.includes('/members');
          const isConnectionMutation = path.includes('/connections');

          const isDeleteMutation = method === 'DELETE';

          // if tree is deleted. clear cache (tree, members, connection)
          if (!isMemberMutation && !isConnectionMutation && isDeleteMutation) {
            await Promise.all([
              this.cacheService.cleanUserFamilyTrees(user.id),
              this.cacheService.cleanFamilyTreeMembers(treeId),
              this.cacheService.cleanFamilyTreeMemberConnections(treeId),
            ]);
          } else if (!isMemberMutation && !isConnectionMutation) {
            // if tree is not deleted but mutated. clear cache (tree)
            await this.cacheService.cleanUserFamilyTrees(user.id);
          } else if (isMemberMutation) {
            // if member is mutated. clear cache (members)
            if (method === 'PUT') {
              await this.cacheService.cleanFamilyTreeMembers(treeId);
            } else {
              // if member is added or deleted. clear cache (members, connections)
              await Promise.all([
                this.cacheService.cleanFamilyTreeMembers(treeId),
                this.cacheService.cleanFamilyTreeMemberConnections(treeId),
              ]);
            }
          }
        }),
      );
    }

    return next.handle();
  }
}
