import { createRoutesView } from 'atomic-router-react';
import { FullscreenLoading } from '~/shared/ui/loading';
import { Home } from './home';
import { NotFound } from './not-found';
import { PublicTreesDetail } from './public-tree-detail';
import { Registration } from './registration';
import { SharedTreeDetail } from './shared-tree-detail';
import { SharedTreeUsers } from './shared-tree-users';
import { TreeDetail } from './tree-detail';
import { PublicTreeList, SharedTreeList, TreeList } from './tree-list';

export const Routing = createRoutesView({
  routes: [
    Home,
    Registration,
    TreeList,
    PublicTreeList,
    SharedTreeList,
    TreeDetail,
    SharedTreeDetail,
    PublicTreesDetail,
    SharedTreeUsers,
    NotFound,
  ],
  otherwise: FullscreenLoading,
});
