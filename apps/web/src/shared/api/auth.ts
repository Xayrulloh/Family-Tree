import { base } from './base';

export const auth = {
  googleAuth: () => {
    return base.get('/auth/google');
  }, // hell no, will we ever send a request to this endpoint
  logout: () => {
    return base.get('/auth/logout');
  },
};
