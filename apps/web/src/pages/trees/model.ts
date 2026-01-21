import type {
  FamilyTreePaginationResponseType,
  SharedFamilyTreePaginationResponseType,
} from '@family-tree/shared';
import { createEffect, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { createEditTreeModel } from '~/features/tree/create-edit';
import { deleteTreeModel } from '~/features/tree/delete';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  const $paginatedTrees = createStore<FamilyTreePaginationResponseType>({
    page: 1,
    perPage: 15,
    totalCount: 0,
    totalPages: 0,
    familyTrees: [],
  });
  const $paginatedSharedTrees =
    createStore<SharedFamilyTreePaginationResponseType>({
      page: 1,
      perPage: 15,
      totalCount: 0,
      totalPages: 0,
      sharedFamilyTrees: [],
    });

  const fetchTreesFx = createEffect(async () =>
    api.tree.findAll({ page: 1, perPage: 15 }),
  );
  const fetchSharedTreesFx = createEffect(async () =>
    api.sharedTree.findAll({ page: 1, perPage: 15 }),
  );

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
    target: $paginatedTrees,
  });

  sample({
    clock: fetchSharedTreesFx.doneData,
    fn: (response) => response.data,
    target: $paginatedSharedTrees,
  });

  return {
    $paginatedTrees,
    $paginatedSharedTrees,
    $fetching: or(fetchTreesFx.pending, fetchSharedTreesFx.pending),
  };
};
