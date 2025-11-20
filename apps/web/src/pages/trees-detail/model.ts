import type {
  FamilyTreeMemberConnectionGetAllResponseType,
  FamilyTreeMemberGetAllResponseType,
} from '@family-tree/shared';
import { attach, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { deleteMemberModel } from '~/features/tree-member/delete';
import { editMemberModel } from '~/features/tree-member/edit';
import { previewMemberModel } from '~/features/tree-member/preview';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams<{ id: string }>) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $members = createStore<FamilyTreeMemberGetAllResponseType>([]);
  const $connections =
    createStore<FamilyTreeMemberConnectionGetAllResponseType>([]);

  const $id = authorizedRoute.$params.map((params) => params.id ?? null);

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

  // Samples
  // Trigger fetches when familyTreeId is set
  sample({
    clock: authorizedRoute.opened,
    target: [fetchMembersFx, fetchConnectionsFx],
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

  // Reset preview on member edit
  sample({
    clock: editMemberModel.editTriggered,
    target: previewMemberModel.reset,
  });

  // Reset preview on member delete active
  sample({
    clock: deleteMemberModel.deleteTriggered,
    target: previewMemberModel.reset,
  });

  // Rerender after member deleted
  sample({
    clock: deleteMemberModel.mutated,
    target: [fetchMembersFx, fetchConnectionsFx],
  });

  return {
    $members,
    $connections,
    $id,
    $loading: or(fetchMembersFx.pending, fetchConnectionsFx.pending),
  };
};
