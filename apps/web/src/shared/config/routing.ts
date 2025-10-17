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
  treesDetail: createRoute(),
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
    path: '/family-trees/:familyTreeId',
    route: routes.treesDetail,
  },
];

export const routerControls = createRouterControls();

export const router = createHistoryRouter({
  routes: routesMap,
  controls: routerControls,
  notFoundRoute: routes.notFound,
});
