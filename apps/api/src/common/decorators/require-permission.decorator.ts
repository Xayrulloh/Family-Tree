import { SetMetadata } from '@nestjs/common';
import { SHARED_TREE_PERMISSION_KEY } from '~/utils/constants';

/**
 * RBAC permission flags on `shared_family_trees` that a route can require.
 */
export type FamilyTreePermission =
  | 'canAddMembers'
  | 'canEditMembers'
  | 'canDeleteMembers';

/**
 * Declares which shared-tree permission(s) a route needs. Read by
 * `SharedAccessGuard` and `FamilyTreeAccessGuard`:
 * - a shared user must hold every listed flag (and not be blocked)
 *
 * Omit the decorator entirely for read-only routes.
 */
export const RequirePermission = (...permissions: FamilyTreePermission[]) =>
  SetMetadata(SHARED_TREE_PERMISSION_KEY, permissions);
