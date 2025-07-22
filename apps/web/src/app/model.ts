import { createEffect, createEvent, createStore, sample } from 'effector';
import { createBrowserHistory } from 'history';
import { appStarted } from '~/shared/config/system';
import { router } from '~/shared/config/routing';

const createBrowserHistoryFx = createEffect(() => createBrowserHistory());

export type Theme = 'light' | 'dark';

export const themeToggled = createEvent();

export const $theme = createStore<Theme>(
  (localStorage.getItem('theme') as Theme) || 'light'
).on(themeToggled, (current) => {
  const next = current === 'light' ? 'dark' : 'light';

  localStorage.setItem('theme', next);

  return next;
});

sample({
  clock: appStarted,
  target: createBrowserHistoryFx,
});

sample({
  clock: createBrowserHistoryFx.doneData,
  target: router.setHistory,
});
