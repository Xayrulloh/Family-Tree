import type {
  FamilyTreePaginationAndSearchQueryType,
  FamilyTreePaginationResponseType,
  SharedFamilyTreePaginationAndSearchQueryType,
  SharedFamilyTreePaginationResponseType,
} from '@family-tree/shared';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { or } from 'patronum';
import { userModel } from '~/entities/user';
import { createEditTreeModel } from '~/features/tree/create-edit';
import { deleteTreeModel } from '~/features/tree/delete';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export type TreesMode = 'my-trees' | 'shared-trees';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $mode = createStore<TreesMode>('my-trees');

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

  const $myTreesPage = createStore<number>(1);
  const $sharedTreesPage = createStore<number>(1);

  // Events
  const myTreesTriggered = createEvent();
  const sharedTreesTriggered = createEvent();
  const myTreesPageChanged = createEvent<number>();
  const sharedTreesPageChanged = createEvent<number>();

  $mode
    .on(myTreesTriggered, () => 'my-trees')
    .on(sharedTreesTriggered, () => 'shared-trees');

  // Effects
  const fetchTreesFx = createEffect(
    async ({ page, perPage }: FamilyTreePaginationAndSearchQueryType) =>
      api.tree.findAll({ page, perPage }),
  );

  const fetchSharedTreesFx = createEffect(
    async ({ page, perPage }: SharedFamilyTreePaginationAndSearchQueryType) =>
      api.sharedTree.findAll({ page, perPage }),
  );

  // Samples

  sample({
    clock: authorizedRoute.opened,
    fn: () => ({ page: 1, perPage: 15 }),
    target: [fetchTreesFx, fetchSharedTreesFx],
  });

  sample({
    clock: myTreesPageChanged,
    fn: (page) => ({ page, perPage: 15 }),
    target: fetchTreesFx,
  });

  sample({
    clock: sharedTreesPageChanged,
    fn: (page) => ({ page, perPage: 15 }),
    target: fetchSharedTreesFx,
  });

  sample({
    clock: myTreesPageChanged,
    target: $myTreesPage,
  });

  sample({
    clock: sharedTreesPageChanged,
    target: $sharedTreesPage,
  });

  sample({
    clock: [createEditTreeModel.mutated, deleteTreeModel.mutated],
    fn: () => 1,
    target: [$myTreesPage, $sharedTreesPage],
  });

  sample({
    clock: [createEditTreeModel.mutated, deleteTreeModel.mutated],
    fn: () => ({ page: 1, perPage: 15 }),
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
    $mode,
    $myTreesPage,
    $sharedTreesPage,
    $paginatedTrees,
    $paginatedSharedTrees,
    $fetching: or(fetchTreesFx.pending, fetchSharedTreesFx.pending),
    myTreesTriggered,
    sharedTreesTriggered,
    myTreesPageChanged,
    sharedTreesPageChanged,
  };
};
