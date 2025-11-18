import { FamilyTreeMemberSchema } from '@family-tree/shared';
import { createEvent, sample } from 'effector';
import type z from 'zod';
import { createForm } from '~/shared/lib/create-form';
import { createDisclosure } from '~/shared/lib/disclosure';

// Schema and Types
export type FormValues = z.infer<typeof formSchema>;

export const formSchema = FamilyTreeMemberSchema.omit({ familyTreeId: true });

// Events
export const previewMemberTriggered = createEvent<FormValues>();
export const reset = createEvent();

// Disclosures
export const disclosure = createDisclosure();

//Form
export const form = createForm<FormValues>();

// Samples
// Open modal and reset form with values on edit trigger
sample({
  clock: previewMemberTriggered,
  target: [disclosure.opened, form.resetFx],
});

// Close modal on reset or successful edit
sample({
  clock: [reset],
  target: [disclosure.closed],
});
