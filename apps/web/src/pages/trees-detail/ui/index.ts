import { routes } from '~/shared/config/routing';
import { createLazyPage } from '~/shared/lib/lazy-page';
import { withSuspense } from '~/shared/lib/with-suspense';
import { Layout } from '~/widgets/layout';

const load = () => import('./ui');

const route = routes.treesDetail;

const Page = createLazyPage({
  route,
  load,
});

export const TreesDetail = {
  route,
  view: withSuspense(Page),
  layout: Layout,
};
