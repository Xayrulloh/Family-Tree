import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberGetAllResponseType,
  UserResponseType,
} from '@family-tree/shared';
import type { AxiosResponse } from 'axios';
import { attach, combine, createStore, type Store, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { addMemberModel } from '~/features/tree-member/add';
import { deleteMemberModel } from '~/features/tree-member/delete';
import { editMemberModel } from '~/features/tree-member/edit';
import { previewMemberModel } from '~/features/tree-member/preview';
import { api } from '~/shared/api';
import { type TreeScope, treeScopeChanged } from '~/shared/config/tree-scope';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

/** Normalized capability flags — replaces the owner `isOwner` vs shared flag split. */
export type TreePermissions = {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageSharedUsers: boolean;
};

const NO_PERMISSIONS: TreePermissions = {
  canAdd: false,
  canEdit: false,
  canDelete: false,
  canManageSharedUsers: false,
};

/** Shape consumed by the visualization + view — decoupled from the tree payload type. */
export type TreeDetailModel = {
  $members: Store<FamilyTreeMemberGetAllResponseType>;
  $connections: Store<FamilyTreeMemberConnectionGetAllResponseType>;
  $id: Store<string | null>;
  $treeName: Store<string | null>;
  $permissions: Store<TreePermissions>;
  $loading: Store<boolean>;
};

export type TreeDetailConfig<TreeData> = LazyPageFactoryParams<{
  id: string;
}> & {
  /** Access prefix this page operates under. */
  scope: TreeScope;
  /** Owner/shared require a session; public is open to anonymous visitors. */
  requireAuth: boolean;
  /** Fetches the tree payload (owner tree, shared record, or public tree). */
  fetchTree: (id: string) => Promise<AxiosResponse<TreeData>>;
  /** Maps the tree payload + current user to normalized permissions. */
  resolvePermissions: (
    tree: TreeData,
    user: UserResponseType | null,
  ) => TreePermissions;
  /** Extracts the tree name (for the image-export filename). */
  getName: (tree: TreeData) => string | null;
};

/**
 * The single tree-detail engine shared by the owner, shared, and public pages.
 * All three differ only in the config passed here.
 */
export const createTreeDetailModel = <TreeData>({
  route,
  scope,
  requireAuth,
  fetchTree,
  resolvePermissions,
  getName,
}: TreeDetailConfig<TreeData>): TreeDetailModel => {
  const pageRoute = requireAuth ? userModel.chainAuthorized({ route }) : route;

  // Stores
  const $members = createStore<FamilyTreeMemberGetAllResponseType>([]);
  const $connections =
    createStore<FamilyTreeMemberConnectionGetAllResponseType>([]);
  const $tree = createStore<TreeData | null>(null);

  const $id = pageRoute.$params.map((params) => params.id ?? null);

  const $permissions = combine($tree, userModel.$user, (tree, user) =>
    tree ? resolvePermissions(tree, user) : NO_PERMISSIONS,
  );
  const $treeName = $tree.map((tree) => (tree ? getName(tree) : null));

  // Effects
  const fetchMembersFx = attach({
    source: $id,
    effect: (familyTreeId: string | null) => {
      if (!familyTreeId) throw new Error('missing id');
      return api.treeMember.findAll({ familyTreeId, scope });
    },
  });

  const fetchConnectionsFx = attach({
    source: $id,
    effect: (familyTreeId: string | null) => {
      if (!familyTreeId) throw new Error('missing id');
      return api.treeMemberConnection.findAll({ familyTreeId, scope });
    },
  });

  const fetchTreeFx = attach({
    source: $id,
    effect: (familyTreeId: string | null) => {
      if (!familyTreeId) throw new Error('missing id');
      return fetchTree(familyTreeId);
    },
  });

  // Tell the global write features which prefix to target
  sample({
    clock: pageRoute.opened,
    fn: () => scope,
    target: treeScopeChanged,
  });

  // Fetch tree first, then members + connections
  sample({ clock: pageRoute.opened, target: fetchTreeFx });

  sample({
    clock: fetchTreeFx.doneData,
    fn: (response) => response.data,
    target: [$tree, fetchMembersFx, fetchConnectionsFx],
  });

  sample({
    clock: fetchMembersFx.doneData,
    fn: (response) => response.data,
    target: $members,
  });

  sample({
    clock: fetchConnectionsFx.doneData,
    fn: (response) => response.data,
    target: $connections,
  });

  // Reset preview when an edit/delete starts
  sample({
    clock: editMemberModel.editTrigger,
    target: previewMemberModel.reset,
  });
  sample({
    clock: deleteMemberModel.deleteTrigger,
    target: previewMemberModel.reset,
  });

  // Refetch after any mutation
  sample({
    clock: [
      editMemberModel.mutated,
      deleteMemberModel.mutated,
      addMemberModel.created,
    ],
    target: [fetchMembersFx, fetchConnectionsFx],
  });

  // Clear state on leave
  sample({
    clock: pageRoute.closed,
    target: [$members.reinit, $connections.reinit, $tree.reinit],
  });

  return {
    $members,
    $connections,
    $id,
    $treeName,
    $permissions,
    $loading: or(fetchMembersFx.pending, fetchConnectionsFx.pending),
  };
};
