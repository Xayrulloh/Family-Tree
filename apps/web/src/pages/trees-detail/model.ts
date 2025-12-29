import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberGetAllResponseType,
  FamilyTreeResponseType,
} from '@family-tree/shared';
import { attach, combine, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { addMemberModel } from '~/features/tree-member/add';
import { deleteMemberModel } from '~/features/tree-member/delete';
import { editMemberModel } from '~/features/tree-member/edit';
import { previewMemberModel } from '~/features/tree-member/preview';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';
import * as treesModel from '../trees/model';

export const factory = ({ route }: LazyPageFactoryParams<{ id: string }>) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $members = createStore<FamilyTreeMemberGetAllResponseType>([]);
  const $connections =
    createStore<FamilyTreeMemberConnectionGetAllResponseType>([]);
  const $tree = createStore<FamilyTreeResponseType | null>(null);

  const $id = authorizedRoute.$params.map((params) => params.id ?? null);
  // biome-ignore lint/suspicious/noExplicitAny: <need to fix>
  const $ownerTrees = treesModel.factory({ route: route as any }).$trees;

  const $isOwner = combine(
    $id,
    $ownerTrees,
    (id, trees) => !!(id && new Set(trees.map((t) => t.id)).has(id)),
  );

  // Effects
  const fetchMembersFx = attach({
    source: $id,
    effect: (familyTreeId: string) => api.treeMember.findAll({ familyTreeId }),
  });

  const fetchConnectionsFx = attach({
    source: $id,
    effect: (familyTreeId: string) =>
      api.treeMemberConnection.findAll({ familyTreeId }),
  });

  const fetchTreeFx = attach({
    source: $id,
    effect: (familyTreeId: string) => api.tree.findById(familyTreeId),
  });

  // Samples
  // Trigger fetches when familyTreeId is set
  sample({
    clock: authorizedRoute.opened,
    target: [fetchMembersFx, fetchConnectionsFx, fetchTreeFx],
  });

  // Update stores with API responses
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

  sample({
    clock: fetchTreeFx.doneData,
    fn: (response) => response.data,
    target: $tree,
  });

  // Reset preview on member edit
  sample({
    clock: editMemberModel.editTrigger,
    target: previewMemberModel.reset,
  });

  // Reset preview on member delete active
  sample({
    clock: deleteMemberModel.deleteTrigger,
    target: previewMemberModel.reset,
  });

  // Rerender after member deleted
  sample({
    clock: [
      editMemberModel.mutated,
      deleteMemberModel.mutated,
      addMemberModel.created,
    ],
    target: [fetchMembersFx, fetchConnectionsFx],
  });

  return {
    $members,
    $connections,
    $tree,
    $id,
    $isOwner,
    $loading: or(fetchMembersFx.pending, fetchConnectionsFx.pending),
  };
};
