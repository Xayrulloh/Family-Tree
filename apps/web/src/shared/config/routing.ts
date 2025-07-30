import {
  createRoute,
  createRouterControls,
  createHistoryRouter,
} from 'atomic-router';

export const routes = {
  browse: createRoute(),
  notFound: createRoute(),
  registration: createRoute(),
  trees: createRoute(),
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
];

export const routerControls = createRouterControls();

export const router = createHistoryRouter({
  routes: routesMap,
  controls: routerControls,
  notFoundRoute: routes.notFound,
});
