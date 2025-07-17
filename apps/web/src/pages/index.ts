import { createRoutesView } from 'atomic-router-react';
import { Home } from './home';
import { Registration } from './registration';
import { Trees } from './trees';
import { Profile } from './profile';

export const Routing = createRoutesView({
  routes: [Home, Registration, Trees, Profile],
});
