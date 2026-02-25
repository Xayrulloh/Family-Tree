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

export type TreesMode = 'my-trees' | 'shared-trees' | 'public-trees';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $mode = createStore<TreesMode>('my-trees');

  const $paginatedUserTrees = createStore<FamilyTreePaginationResponseType>({
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

  const $paginatedPublicTrees = createStore<FamilyTreePaginationResponseType>({
    page: 1,
    perPage: 15,
    totalCount: 0,
    totalPages: 0,
    familyTrees: [],
  });

  const $myTreesPage = createStore<number>(1);
  const $sharedTreesPage = createStore<number>(1);
  const $publicTreesPage = createStore<number>(1);

  const $myTreesSearchQuery = createStore<string>('');
  const $sharedTreesSearchQuery = createStore<string>('');
  const $publicTreesSearchQuery = createStore<string>('');

  const $myTreesDebouncedSearchQuery = createStore<string>('');
  const $sharedTreesDebouncedSearchQuery = createStore<string>('');
  const $publicTreesDebouncedSearchQuery = createStore<string>('');

  // Events
  const myTreesTriggered = createEvent();
  const sharedTreesTriggered = createEvent();
  const publicTreesTriggered = createEvent();

  const myTreesPageChanged = createEvent<number>();
  const sharedTreesPageChanged = createEvent<number>();
  const publicTreesPageChanged = createEvent<number>();

  const myTreesSearchChanged = createEvent<string>();
  const sharedTreesSearchChanged = createEvent<string>();
  const publicTreesSearchChanged = createEvent<string>();

  $mode
    .on(myTreesTriggered, () => 'my-trees')
    .on(sharedTreesTriggered, () => 'shared-trees')
    .on(publicTreesTriggered, () => 'public-trees');

  $myTreesSearchQuery.on(myTreesSearchChanged, (_, query) => query);
  $sharedTreesSearchQuery.on(sharedTreesSearchChanged, (_, query) => query);
  $publicTreesSearchQuery.on(publicTreesSearchChanged, (_, query) => query);

  // Debounce search queries
  sample({
    clock: debounce({ source: myTreesSearchChanged, timeout: 300 }),
    filter: (query) => query.length === 0 || query.length >= 3,
    target: $myTreesDebouncedSearchQuery,
  });

  sample({
    clock: debounce({ source: sharedTreesSearchChanged, timeout: 300 }),
    filter: (query) => query.length === 0 || query.length >= 3,
    target: $sharedTreesDebouncedSearchQuery,
  });

  sample({
    clock: debounce({ source: publicTreesSearchChanged, timeout: 300 }),
    filter: (query) => query.length === 0 || query.length >= 3,
    target: $publicTreesDebouncedSearchQuery,
  });

  // Effects
  const fetchTreesFx = createEffect(
    async ({ page, perPage, name }: FamilyTreePaginationAndSearchQueryType) =>
      api.tree.findAll({ page, perPage, name, isPublic: false }),
  );

  const fetchSharedTreesFx = createEffect(
    async ({
      page,
      perPage,
      name,
    }: SharedFamilyTreePaginationAndSearchQueryType) =>
      api.sharedTree.findAll({ page, perPage, name }),
  );

  const fetchPublicTreesFx = createEffect(
    async ({ page, perPage, name }: FamilyTreePaginationAndSearchQueryType) =>
      api.tree.findAll({ page, perPage, name, isPublic: true }),
  );

  // Samples

  sample({
    clock: authorizedRoute.opened,
    fn: () => ({ page: 1, perPage: 15 }),
    target: [fetchTreesFx, fetchSharedTreesFx, fetchPublicTreesFx],
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

  sample({
    clock: publicTreesPageChanged,
    source: $publicTreesDebouncedSearchQuery,
    fn: (searchQuery, page) => ({
      page,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchPublicTreesFx,
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

  sample({
    clock: $publicTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchPublicTreesFx,
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
    clock: $publicTreesDebouncedSearchQuery,
    fn: () => 1,
    target: $publicTreesPage,
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
    clock: publicTreesPageChanged,
    target: $publicTreesPage,
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

  // TODO: Xikmat is this ok?
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

  // TODO: Xikmat is this ok?
  sample({
    clock: [createEditTreeModel.mutated, deleteTreeModel.mutated],
    source: $publicTreesDebouncedSearchQuery,
    fn: (searchQuery) => ({
      page: 1,
      perPage: 15,
      name: searchQuery,
    }),
    target: fetchPublicTreesFx,
  });

  sample({
    clock: fetchTreesFx.doneData,
    fn: (response) => response.data,
    target: $paginatedUserTrees,
  });

  sample({
    clock: fetchSharedTreesFx.doneData,
    fn: (response) => response.data,
    target: $paginatedSharedTrees,
  });

  sample({
    clock: fetchPublicTreesFx.doneData,
    fn: (response) => response.data,
    target: $paginatedPublicTrees,
  });

  return {
    $mode,
    $myTreesPage,
    $sharedTreesPage,
    $publicTreesPage,
    $myTreesSearchQuery,
    $sharedTreesSearchQuery,
    $publicTreesSearchQuery,
    $paginatedUserTrees,
    $paginatedSharedTrees,
    $paginatedPublicTrees,
    $fetching: or(
      fetchTreesFx.pending,
      fetchSharedTreesFx.pending,
      fetchPublicTreesFx.pending,
    ),
    myTreesTriggered,
    sharedTreesTriggered,
    publicTreesTriggered,
    myTreesPageChanged,
    sharedTreesPageChanged,
    publicTreesPageChanged,
    myTreesSearchChanged,
    sharedTreesSearchChanged,
    publicTreesSearchChanged,
  };
};
