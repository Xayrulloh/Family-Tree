import type { SharedFamilyTreeUsersPaginationResponseType } from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { debounce } from 'patronum';
import { userModel } from '~/entities/user';
import { editSharedTreeModel } from '~/features/shared-tree-users/edit';
import { api } from '~/shared/api';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams<{ id: string }>) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  // Stores
  const $paginatedUsers =
    createStore<SharedFamilyTreeUsersPaginationResponseType>({
      page: 1,
      perPage: 15,
      totalCount: 0,
      totalPages: 0,
      sharedFamilyTreeUsers: [],
    });

  const $page = createStore<number>(1);
  const $searchQuery = createStore<string>('');
  const $debouncedSearchQuery = createStore<string>('');

  const $familyTreeId = authorizedRoute.$params.map(
    (params) => params.id ?? null,
  );

  // Events
  const pageChanged = createEvent<number>();
  const searchChanged = createEvent<string>();

  $page.on(pageChanged, (_, page) => page);

  $searchQuery.on(searchChanged, (_, query) => query);

  // Effects
  const fetchSharedTreeUsersFx = attach({
    source: {
      familyTreeId: $familyTreeId,
      page: $page,
      search: $debouncedSearchQuery,
    },
    effect: ({ familyTreeId, page, search }) => {
      if (!familyTreeId) {
        throw new Error('Local: no familyTreeId');
      }

      return api.sharedTree.findUsers(
        { familyTreeId },
        { page, perPage: 15, name: search || undefined },
      );
    },
  });

  // Samples
  sample({
    clock: [
      authorizedRoute.opened,
      $page,
      $debouncedSearchQuery,
      editSharedTreeModel.mutated,
    ],
    target: fetchSharedTreeUsersFx,
  });

  sample({
    clock: $debouncedSearchQuery,
    fn: () => 1,
    target: $page,
  });

  sample({
    clock: debounce({ source: searchChanged, timeout: 300 }),
    target: $debouncedSearchQuery,
  });

  sample({
    clock: fetchSharedTreeUsersFx.doneData,
    fn: (response) => response.data,
    target: $paginatedUsers,
  });

  sample({
    clock: fetchSharedTreeUsersFx.failData,
    fn: async (response: unknown) => {
      const error = response as { status?: number };
      if (error.status && error.status >= 400 && error.status < 500) {
        setTimeout(() => {
          window.location.replace('/family-trees');
        }, 2000);
      }
    },
  });

  // Reset
  sample({
    clock: authorizedRoute.closed,
    target: [
      $paginatedUsers.reinit,
      $page.reinit,
      $searchQuery.reinit,
      $debouncedSearchQuery.reinit,
    ],
  });

  return {
    $paginatedUsers,
    $familyTreeId,
    $page,
    $searchQuery,
    $loading: fetchSharedTreeUsersFx.pending,
    pageChanged,
    searchChanged,
  };
};
