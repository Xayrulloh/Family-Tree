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
    path: '/family-trees/:id',
    route: routes.treesDetail,
  },
  {
    path: '/family-trees/:id/shared',
    route: routes.sharedTreesDetail,
  },
  {
    path: '/family-trees/:id/shared-users',
    route: routes.sharedTreeUsers,
  },
];

export const routerControls: ReturnType<typeof createRouterControls> =
  createRouterControls();

export const router = createHistoryRouter({
  routes: routesMap,
  controls: routerControls,
  notFoundRoute: routes.notFound,
});
