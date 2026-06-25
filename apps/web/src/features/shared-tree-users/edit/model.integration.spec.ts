import { allSettled, fork } from 'effector';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '~/shared/api';
import * as model from './model';

const sharedUser = {
  familyTreeId: 'tree-1',
  userId: 'user-9',
  canAddMembers: true,
  canEditMembers: false,
  canDeleteMembers: true,
  isBlocked: false,
} as never;

describe('shared-tree-users/edit model (integration)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('editTrigger calls api.sharedTree.update with mapped param and body', async () => {
    const updateSpy = vi
      .spyOn(api.sharedTree, 'update')
      .mockResolvedValue({ data: undefined } as never);
    const scope = fork();

    await allSettled(model.editTrigger, { scope, params: sharedUser });

    expect(updateSpy).toHaveBeenCalledWith(
      { familyTreeId: 'tree-1', userId: 'user-9' },
      {
        canAddMembers: true,
        canEditMembers: false,
        canDeleteMembers: true,
        isBlocked: false,
      },
    );
  });

  it('resets $sharedTree after a successful update', async () => {
    vi.spyOn(api.sharedTree, 'update').mockResolvedValue({
      data: undefined,
    } as never);
    const scope = fork();

    await allSettled(model.editTrigger, { scope, params: sharedUser });

    expect(scope.getState(model.$sharedTree)).toBeNull();
  });
});
