import type { FamilyTreeSchemaType, SharedFamilyTreeArrayResponseType } from '@family-tree/shared';
import { createEffect, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { createEditTreeModel } from '~/features/tree/create-edit';
import { deleteTreeModel } from '~/features/tree/delete';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  const $trees = createStore<FamilyTreeSchemaType[]>([]);
  const $sharedTrees = createStore<SharedFamilyTreeArrayResponseType>([]);

  const fetchTreesFx = createEffect(async () => api.tree.findAll());
  const fetchSharedTreesFx = createEffect(async () => api.sharedTree.findAll());

  sample({
    clock: [
      authorizedRoute.opened,
      createEditTreeModel.mutated,
      deleteTreeModel.mutated,
    ],
    target: [fetchTreesFx, fetchSharedTreesFx],
  });

  sample({
    clock: fetchTreesFx.doneData,
    fn: (response) => response.data,
    target: $trees,
  });

  sample({
    clock: fetchSharedTreesFx.doneData,
    fn: (response) => response.data,
    target: $sharedTrees,
  });

  return {
    $trees,
    $sharedTrees,
    $fetching: or(fetchTreesFx.pending, fetchSharedTreesFx.pending),
  };
};
