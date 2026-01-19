import type { SharedFamilyTreeUsersArrayResponseType } from '@family-tree/shared';
import { attach, createStore, sample } from 'effector';
import { userModel } from '~/entities/user';
import { editSharedTreeModel } from '~/features/shared-tree-users/edit';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams<{ id: string }>) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $users = createStore<SharedFamilyTreeUsersArrayResponseType>([]);

  const $familyTreeId = authorizedRoute.$params.map(
    (params) => params.id ?? null,
  );

  // Effects
  const fetchSharedTreeUsersFx = attach({
    source: $familyTreeId,
    effect: (familyTreeId) => api.sharedTree.findUsers({ familyTreeId }),
  });

  // Samples
  sample({
    clock: [authorizedRoute.opened, editSharedTreeModel.mutated],
    target: fetchSharedTreeUsersFx,
  });

  sample({
    clock: fetchSharedTreeUsersFx.doneData,
    fn: (response) => response.data,
    target: $users,
  });

  sample({
    clock: fetchSharedTreeUsersFx.failData,
    // FIXME: Xikmat pls help
    fn: async (response: any) => {
      console.log('🚀 ~ factory ~ response:', response.status);
      // FIXME: Xikmat pls help
      if (response.status >= 400 && response.status < 500) {
        await Promise.resolve(() => {
          setTimeout(() => {
            window.location.replace('/family-trees');
          }, 2000);
        });
      }
    },
  });

  // Reset
  sample({
    clock: authorizedRoute.closed,
    target: $users.reinit,
  });

  return {
    $users,
    $familyTreeId,
    $loading: fetchSharedTreeUsersFx.pending,
  };
};
