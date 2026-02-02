import { createEvent, createStore, sample } from 'effector';
import { createDisclosure } from '~/shared/lib/disclosure';
import { infoFx } from '~/shared/lib/message';

export const disclosure = createDisclosure();

export const $shareUrl = createStore('');

export const shareTrigger = createEvent<{ url: string }>();
export const copyTrigger = createEvent();

sample({
  clock: shareTrigger,
  fn: ({ url }) => url,
  target: [$shareUrl, disclosure.opened],
});

sample({
  clock: copyTrigger,
  source: $shareUrl,
  fn: (url) => {
    navigator.clipboard.writeText(`${url}/shared`);

    infoFx('Link copied to clipboard');
  },
});

sample({
  clock: copyTrigger,
  target: disclosure.closed,
});
