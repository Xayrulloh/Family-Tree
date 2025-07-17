import { routes } from '~/shared/config/routing';
import { createLazyPage } from '~/shared/lib/lazy-page';
import { withSuspense } from '~/shared/lib/with-suspense';
import { Layout } from '~/widgets/layout';

const load = () => import('./ui');

const route = routes.profile;

const Page = createLazyPage({
  route,
  load,
});

export const Profile = {
  route,
  view: withSuspense(Page),
  layout: Layout,
};
