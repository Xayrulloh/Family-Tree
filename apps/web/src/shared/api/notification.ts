import { AxiosRequestConfig } from 'axios';
import { NotificationResponseType } from '@family-tree/shared';
import { base } from './base';

export const notification = {
  findAll: (config?: AxiosRequestConfig) => {
    return base.get<NotificationResponseType>(`/notifications`, config);
  },
  read: (config?: AxiosRequestConfig) => {
    return base.get<void>(`/notifications/read`, config);
  },
};
