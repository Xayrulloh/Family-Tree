import {
  FCMTokenCreateDeleteRequestType,
  FCMTokenResponseType,
} from '@family-tree/shared';
import { AxiosRequestConfig } from 'axios';
import { base } from './base';

export const fcmToken = {
  create: (
    body: FCMTokenCreateDeleteRequestType,
    config?: AxiosRequestConfig
  ) => {
    return base.post<FCMTokenResponseType>('/fcm-tokens', body, config);
  },
  delete: (
    body: FCMTokenCreateDeleteRequestType,
    config?: AxiosRequestConfig
  ) => {
    return base.delete<FCMTokenResponseType>('/fcm-tokens', {
      data: body,
      ...config,
    });
  },
};
