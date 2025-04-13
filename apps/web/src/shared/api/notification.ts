import { NotificationResponseType } from '@family-tree/shared';
import { base } from './base';

export const notification = {
  findAll: () => {
    return base.get<NotificationResponseType[]>('/notifications');
  },
  read: () => {
    return base.get('/notifications/read');
  },
};
