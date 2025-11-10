import type {
  FamilyTreeMemberConnectionSchemaType,
  MemberSchemaType,
} from '@family-tree/shared';
import { attach, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $members = createStore<MemberSchemaType[]>([]);
  const $connections = createStore<FamilyTreeMemberConnectionSchemaType[]>([]);
  const $familyTreeId = createStore<string>('');

  // Effects
  const fetchMembersFx = attach({
    source: $familyTreeId,
    effect: (familyTreeId: string) => api.treeMember.findAll({ familyTreeId }),
  });

  const fetchConnectionsFx = attach({
    source: $familyTreeId,
    effect: (familyTreeId: string) =>
      api.treeMemberConnection.findAll({ familyTreeId }),
  });

  // Extract familyTreeId from route params
  sample({
    clock: authorizedRoute.opened,
    source: route.$params,
    fn: (params) => (params as any).familyTreeId,
    target: $familyTreeId,
  });

  // Trigger fetches when familyTreeId is set
  sample({
    clock: $familyTreeId,
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
    $familyTreeId,
    $loading: or(fetchMembersFx.pending, fetchConnectionsFx.pending),
  };
};
