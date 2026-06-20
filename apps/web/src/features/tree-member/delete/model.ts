import type {
  FamilyTreeMemberDeletePreviewType,
  FamilyTreeMemberGetResponseType,
} from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';
import { $treeScope } from '~/shared/config/tree-scope';
import { createDisclosure } from '~/shared/lib/disclosure';

export const deleteTrigger = createEvent<FamilyTreeMemberGetResponseType>();
export const deleted = createEvent();

export const $member = createStore<FamilyTreeMemberGetResponseType | null>(
  null,
);
export const $preview = createStore<FamilyTreeMemberDeletePreviewType | null>(
  null,
);

export const disclosure = createDisclosure();

const fetchPreviewFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Local: no member');

    return api.treeMember.deletePreview({
      familyTreeId: member.familyTreeId,
      id: member.id,
      scope,
    });
  },
});

const deleteTreeFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Local: no member');

    return api.treeMember.delete({
      familyTreeId: member.familyTreeId,
      id: member.id,
      scope,
    });
  },
});

export const $previewLoading = fetchPreviewFx.pending;
export const $mutating = deleteTreeFx.pending;
export const mutated = deleteTreeFx.done;

// On trigger: set member, open modal, fetch preview
sample({ clock: deleteTrigger, target: $member });
sample({ clock: deleteTrigger, target: disclosure.opened });
sample({ clock: deleteTrigger, target: fetchPreviewFx });

// Store preview result
sample({
  clock: fetchPreviewFx.doneData,
  fn: (response) => response.data,
  target: $preview,
});

// On preview error: show blocked state so the modal renders a message instead of spinning
sample({
  clock: fetchPreviewFx.fail,
  fn: () => ({
    canDelete: false as const,
    blockReason: 'Failed to load delete preview. Please try again.',
    spouseToDelete: null,
  }),
  target: $preview,
});

// On confirm: delete (attach reads $member and $treeScope from its own source)
sample({ clock: deleted, target: deleteTreeFx });

// On done: close modal
sample({ clock: mutated, target: disclosure.closed });

// On delete error: close modal (Axios interceptor already shows the error toast)
sample({ clock: deleteTreeFx.fail, target: disclosure.closed });

// On close: reset stores
sample({ clock: disclosure.closed, target: [$member.reinit, $preview.reinit] });
