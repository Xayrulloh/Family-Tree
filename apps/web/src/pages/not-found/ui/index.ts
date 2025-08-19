import { routes } from '~/shared/config/routing';
import { createLazyPage } from '~/shared/lib/lazy-page';
import { withSuspense } from '~/shared/lib/with-suspense';

const load = () => import('./ui');

const route = routes.notFound;

const Page = createLazyPage({
  route,
  load,
});

export const NotFound = {
  route,
  view: withSuspense(Page),
};
