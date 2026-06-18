import {
  createHistoryRouter,
  createRoute,
  createRouterControls,
} from 'atomic-router';

export const routes = {
  browse: createRoute(),
  notFound: createRoute(),
  registration: createRoute(),
  trees: createRoute(),
  treesDetail: createRoute<{ id: string }>(),
  publicTreeList: createRoute(),
  publicTreesDetail: createRoute<{ id: string }>(),
  sharedTreeList: createRoute(),
  sharedTreesDetail: createRoute<{ id: string }>(),
  sharedTreeUsers: createRoute<{ id: string }>(),
};

export const routesMap = [
  {
    path: '/',
    route: routes.browse,
  },
  {
    path: '/register',
    route: routes.registration,
  },
  {
    path: '/family-trees',
    route: routes.trees,
  },
  {
    path: '/family-trees/public',
    route: routes.publicTreeList,
  },
  {
    path: '/family-trees/public/:id',
    route: routes.publicTreesDetail,
  },
  {
    path: '/family-trees/shared',
    route: routes.sharedTreeList,
  },
  {
    path: '/family-trees/shared/:id',
    route: routes.sharedTreesDetail,
  },
  {
    path: '/family-trees/shared/:id/users',
    route: routes.sharedTreeUsers,
  },
  {
    path: '/family-trees/:id',
    route: routes.treesDetail,
  },
];

export const routerControls: ReturnType<typeof createRouterControls> =
  createRouterControls();

export const router = createHistoryRouter({
  routes: routesMap,
  controls: routerControls,
  notFoundRoute: routes.notFound,
});
