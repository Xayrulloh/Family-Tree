import { createRoutesView } from 'atomic-router-react';
import { FullscreenLoading } from '~/shared/ui/loading';
import { Home } from './home';
import { NotFound } from './not-found';
import { Registration } from './registration';
import { SharedTreeUsers } from './shared-tree-users';
import { SharedTreesDetail } from './shared-trees-detail';
import { Trees } from './trees';
import { TreesDetail } from './trees-detail';
import { PublicTreesDetail } from './trees-public-detail';

export const Routing = createRoutesView({
  routes: [
    Home,
    Registration,
    Trees,
    TreesDetail,
    SharedTreesDetail,
    PublicTreesDetail,
    SharedTreeUsers,
    NotFound,
  ],
  otherwise: FullscreenLoading,
});
