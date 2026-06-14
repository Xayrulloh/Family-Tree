import { createEffect, createEvent, createStore, sample } from 'effector';
import { createDisclosure } from '~/shared/lib/disclosure';
import { errorFx, infoFx } from '~/shared/lib/message';

export const disclosure = createDisclosure();

export const $shareUrl = createStore('');

export const shareTrigger = createEvent<{ id: string }>();
export const copyTrigger = createEvent();

export const copyToClipboardFx = createEffect(async (url: string) => {
  return navigator.clipboard.writeText(url);
});

sample({
  clock: shareTrigger,
  fn: ({ id }) => `${window.location.origin}/family-trees/shared/${id}`,
  target: [$shareUrl, disclosure.opened],
});

sample({
  clock: copyTrigger,
  source: $shareUrl,
  target: copyToClipboardFx,
});

sample({
  clock: copyToClipboardFx.done,
  fn: () => 'Link copied to clipboard',
  target: infoFx,
});

sample({
  clock: copyToClipboardFx.fail,
  fn: () => 'Failed to copy link to clipboard',
  target: errorFx,
});

sample({
  clock: copyTrigger,
  target: disclosure.closed,
});
