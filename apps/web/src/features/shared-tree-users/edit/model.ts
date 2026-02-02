import type { SharedFamilyTreeUserResponseType } from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';

// Initialization of Events
export const editTrigger = createEvent<SharedFamilyTreeUserResponseType>();

// Stores created tree id
export const $sharedTree = createStore<SharedFamilyTreeUserResponseType | null>(
  null,
);

// Attaching
// Edits shared tree
const editSharedTreeFx = attach({
  source: $sharedTree,
  effect: (sharedTree) => {
    if (!sharedTree) {
      throw new Error('Local: no shared tree');
    }

    return api.sharedTree.update(
      {
        familyTreeId: sharedTree.familyTreeId,
        userId: sharedTree.userId,
      },
      {
        canAddMembers: sharedTree.canAddMembers,
        canEditMembers: sharedTree.canEditMembers,
        canDeleteMembers: sharedTree.canDeleteMembers,
        isBlocked: sharedTree.isBlocked,
      },
    );
  },
});

// Mutation
// Pending effects holder
export const $mutating = editSharedTreeFx.pending;

// Resolved effects holder
export const mutated = editSharedTreeFx.done;

// Events of Samples
// If user starts editing, put id to $id
sample({
  clock: editTrigger,
  target: [$sharedTree, editSharedTreeFx],
});

// If user starts deleting, send it to deleteTreeFx
sample({
  clock: mutated,
  target: $sharedTree.reinit,
});
