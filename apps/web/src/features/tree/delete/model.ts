import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';
import { createDisclosure } from '~/shared/lib/disclosure';

// Initialization of Events
export const deleteTriggered = createEvent<{ id: string }>();
export const deleted = createEvent();

// Stores created tree id
export const $id = createStore<string | null>(null);

// Initialization of Closures
// Notifies about opening and closing of the form
export const disclosure = createDisclosure();

// Attaching
// Deletes tree
const deleteTreeFx = attach({
  source: $id,
  effect: (id) => {
    if (!id) {
      throw new Error('Local: no id');
    }

    return api.tree.delete(id);
  },
});

// Mutation
// Pending effects holder
export const $mutating = deleteTreeFx.pending;

// Resolved effects holder
export const mutated = deleteTreeFx.done;

// Events of Samples
// If user starts deleting, open the Dropdown
sample({
  clock: deleteTriggered,
  target: disclosure.opened,
});

// If user starts deleting, put id to $id
sample({
  clock: deleteTriggered,
  fn: (response) => response.id,
  target: $id,
});

// If user starts deleting, send it to deleteTreeFx
sample({
  clock: deleted,
  source: $id,
  target: deleteTreeFx,
});

// Events of Closing and Cleaning of Form
// If user deletes, close the form and reinit mode
sample({
  clock: [mutated],
  target: [disclosure.closed],
});

// If user closes form, reset form
sample({
  clock: disclosure.closed,
  target: [$id.reinit],
});
