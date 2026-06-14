import { routes } from '~/shared/config/routing';
import { createLazyPage } from '~/shared/lib/lazy-page';
import { withSuspense } from '~/shared/lib/with-suspense';
import { Layout } from '~/widgets/layout';

const load = () => import('./ui');

const MyTreesPage = createLazyPage({
  route: routes.trees,
  staticDeps: { initialMode: 'my-trees' as const },
  load,
});

const PublicTreesListPage = createLazyPage({
  route: routes.publicTreeList,
  staticDeps: { initialMode: 'public-trees' as const },
  load,
});

const SharedTreesListPage = createLazyPage({
  route: routes.sharedTreeList,
  staticDeps: { initialMode: 'shared-trees' as const },
  load,
});

export const TreeList = {
  route: routes.trees,
  view: withSuspense(MyTreesPage),
  layout: Layout,
};

export const PublicTreeList = {
  route: routes.publicTreeList,
  view: withSuspense(PublicTreesListPage),
  layout: Layout,
};

export const SharedTreeList = {
  route: routes.sharedTreeList,
  view: withSuspense(SharedTreesListPage),
  layout: Layout,
};
