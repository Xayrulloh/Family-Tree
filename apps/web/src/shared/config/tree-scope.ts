import { createEvent, createStore } from 'effector';

/**
 * Which access prefix the current tree-detail page operates under. Mirrors the
 * backend route isolation: owner (bare path), shared (`/shared`), public
 * (`/public`). The active page sets this on open so the shared write features
 * (add/edit/delete) hit the correct endpoint.
 */
export type TreeScope = 'owner' | 'shared' | 'public';

export const treeScopeChanged = createEvent<TreeScope>();

export const $treeScope = createStore<TreeScope>('owner').on(
  treeScopeChanged,
  (_, scope) => scope,
);

/** URL segment for a scope: owner → '', shared → '/shared', public → '/public'. */
export const scopeSegment = (scope: TreeScope = 'owner'): string =>
  scope === 'owner' ? '' : `/${scope}`;
