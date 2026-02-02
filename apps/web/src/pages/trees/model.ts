import type {
  FamilyTreePaginationAndSearchQueryType,
  FamilyTreePaginationResponseType,
  SharedFamilyTreePaginationAndSearchQueryType,
  SharedFamilyTreePaginationResponseType,
} from '@family-tree/shared';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { debounce, or } from 'patronum';
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

  const $myTreesSearchQuery = createStore<string>('');
  const $sharedTreesSearchQuery = createStore<string>('');
  const $myTreesDebouncedSearchQuery = createStore<string>('');
  const $sharedTreesDebouncedSearchQuery = createStore<string>('');

  // Events
  const myTreesTriggered = createEvent();
  const sharedTreesTriggered = createEvent();
  const myTreesPageChanged = createEvent<number>();
  const sharedTreesPageChanged = createEvent<number>();

  const myTreesSearchChanged = createEvent<string>();
  const sharedTreesSearchChanged = createEvent<string>();

  $mode
    .on(myTreesTriggered, () => 'my-trees')
    .on(sharedTreesTriggered, () => 'shared-trees');

  $myTreesSearchQuery.on(myTreesSearchChanged, (_, query) => query);
  $sharedTreesSearchQuery.on(sharedTreesSearchChanged, (_, query) => query);

  // Debounce search queries
  sample({
    clock: debounce({ source: myTreesSearchChanged, timeout: 300 }),
    target: $myTreesDebouncedSearchQuery,
  });

  sample({
    clock: debounce({ source: sharedTreesSearchChanged, timeout: 300 }),
    target: $sharedTreesDebouncedSearchQuery,
  });

  // Effects
  const fetchTreesFx = createEffect(
    async ({ page, perPage, name }: FamilyTreePaginationAndSearchQueryType) =>
      api.tree.findAll({ page, perPage, name }),
  );

  const fetchSharedTreesFx = createEffect(
    async ({
      page,
      perPage,
      name,
    }: SharedFamilyTreePaginationAndSearchQueryType) =>
      api.sharedTree.findAll({ page, perPage, name }),
  );

  // Samples

  sample({
    clock: authorizedRoute.opened,
    fn: () => ({ page: 1, perPage: 15 }),
    target: [fetchTreesFx, fetchSharedTreesFx],
  });

  sample({
    clock: myTreesPageChanged,
    source: $myTreesDebouncedSearchQuery,
    fn: (searchQuery, page) => ({
      page,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchTreesFx,
  });

  sample({
    clock: sharedTreesPageChanged,
    source: $sharedTreesDebouncedSearchQuery,
    fn: (searchQuery, page) => ({
      page,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchSharedTreesFx,
  });

  // Fetch when search query changes (reset to page 1)
  sample({
    clock: $myTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchTreesFx,
  });

  sample({
    clock: $sharedTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchSharedTreesFx,
  });

  // Reset page to 1 when search query changes
  sample({
    clock: $myTreesDebouncedSearchQuery,
    fn: () => 1,
    target: $myTreesPage,
  });

  sample({
    clock: $sharedTreesDebouncedSearchQuery,
    fn: () => 1,
    target: $sharedTreesPage,
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
    source: $myTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchTreesFx,
  });

  sample({
    clock: [createEditTreeModel.mutated, deleteTreeModel.mutated],
    source: $sharedTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchSharedTreesFx,
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
    $myTreesSearchQuery,
    $sharedTreesSearchQuery,
    $paginatedTrees,
    $paginatedSharedTrees,
    $fetching: or(fetchTreesFx.pending, fetchSharedTreesFx.pending),
    myTreesTriggered,
    sharedTreesTriggered,
    myTreesPageChanged,
    sharedTreesPageChanged,
    myTreesSearchChanged,
    sharedTreesSearchChanged,
  };
};
