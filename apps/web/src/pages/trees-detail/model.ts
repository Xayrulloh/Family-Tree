import type {
  FamilyTreeMemberConnectionSchemaType,
  MemberSchemaType,
} from '@family-tree/shared';
import { attach, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams<{ id: string }>) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $members = createStore<Omit<MemberSchemaType, 'familyTreeId'>[]>([]);
  const $connections = createStore<FamilyTreeMemberConnectionSchemaType[]>([]);
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
    fn: (response) => response.data.map((data) => data.member!),
    target: $members,
  });

  sample({
    clock: fetchConnectionsFx.doneData,
    fn: (response) => response.data,
    target: $connections,
  });

  return {
    $members,
    $connections,
    $id,
    $loading: or(fetchMembersFx.pending, fetchConnectionsFx.pending),
  };
};
