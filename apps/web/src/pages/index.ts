import { createRoutesView } from 'atomic-router-react';
import { Home } from './home';
import { NotFound } from './not-found';
import { Registration } from './registration';
import { Trees } from './trees';

export const Routing = createRoutesView({
  routes: [Home, Registration, Trees, NotFound],
});
