import { createEffect, createEvent, createStore, sample } from 'effector';
import { persist } from 'effector-storage/local';
import { createBrowserHistory } from 'history';
import { appStarted } from '~/shared/config/system';
import { router } from '~/shared/config/routing';

const createBrowserHistoryFx = createEffect(() => createBrowserHistory());

export type Theme = 'light' | 'dark';

export const themeToggled = createEvent();

export const $theme = createStore<Theme>('light').on(
  themeToggled,
  (current) => (current === 'light' ? 'dark' : 'light')
);

persist({
  store: $theme,
  key: '@app/theme',
});

sample({
  clock: appStarted,
  target: createBrowserHistoryFx,
});

sample({
  clock: createBrowserHistoryFx.doneData,
  target: router.setHistory,
});
