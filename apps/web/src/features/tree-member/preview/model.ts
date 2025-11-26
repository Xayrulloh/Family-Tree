import type { FamilyTreeMemberGetResponseType } from '@family-tree/shared';
import { createEvent, createStore, sample } from 'effector';
import { createDisclosure } from '~/shared/lib/disclosure';

// Events
export const previewMemberTrigger =
  createEvent<FamilyTreeMemberGetResponseType>();
export const reset = createEvent();

// Stores
export const $member = createStore<FamilyTreeMemberGetResponseType | null>(
  null,
);

// Disclosures
export const disclosure = createDisclosure();

// Samples
// Open modal and reset form with values on edit trigger
sample({
  clock: previewMemberTrigger,
  target: [disclosure.opened, $member],
});

// Close modal on reset or successful edit
sample({
  clock: [reset],
  target: [disclosure.closed],
});
