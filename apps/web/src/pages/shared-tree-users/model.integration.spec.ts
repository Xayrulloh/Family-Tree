import { createRoute } from 'atomic-router';
import { allSettled, fork } from 'effector';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { $session, SessionStatus } from '~/entities/user/model';
import { api } from '~/shared/api';

import { factory } from './model';

describe('pages/shared-tree-users factory (integration)', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('initial state', () => {
    it('$paginatedUsers starts with an empty list', () => {
      const route = createRoute<{ id: string }>();
      const model = factory({ route });
      const scope = fork();

      expect(
        scope.getState(model.$paginatedUsers).sharedFamilyTreeUsers,
      ).toHaveLength(0);
    });

    it('$page starts at 1', () => {
      const route = createRoute<{ id: string }>();
      const model = factory({ route });
      const scope = fork();

      expect(scope.getState(model.$page)).toBe(1);
    });

    it('$searchQuery starts as empty string', () => {
      const route = createRoute<{ id: string }>();
      const model = factory({ route });
      const scope = fork();

      expect(scope.getState(model.$searchQuery)).toBe('');
    });
  });

  describe('pagination', () => {
    it('pageChanged updates $page', async () => {
      vi.spyOn(api.sharedTree, 'findUsers').mockResolvedValue({
        data: {
          page: 1,
          perPage: 15,
          totalCount: 0,
          totalPages: 0,
          sharedFamilyTreeUsers: [],
        },
      } as unknown as Awaited<ReturnType<typeof api.sharedTree.findUsers>>);

      const route = createRoute<{ id: string }>();
      const model = factory({ route });
      const scope = fork({ values: [[$session, SessionStatus.Authorized]] });

      await allSettled(route.opened, {
        scope,
        params: { params: { id: 'tree-1' }, query: {} },
      });
      await allSettled(model.pageChanged, { scope, params: 3 });

      expect(scope.getState(model.$page)).toBe(3);
      expect(api.sharedTree.findUsers).toHaveBeenLastCalledWith(
        { familyTreeId: 'tree-1' },
        { page: 3, perPage: 15, name: undefined },
      );
    });
  });

  describe('search', () => {
    it('searchChanged updates $searchQuery', async () => {
      const route = createRoute<{ id: string }>();
      const model = factory({ route });
      const scope = fork();

      await allSettled(model.searchChanged, { scope, params: 'Alice' });

      expect(scope.getState(model.$searchQuery)).toBe('Alice');
    });
  });
});
