import { FCMTokenCreateDeleteRequestType, FCMTokenResponseType } from '@family-tree/shared';
import { base } from './base';

export const fcmToken = {
  create: (body: FCMTokenCreateDeleteRequestType) => {
    return base.post<FCMTokenResponseType>('/fcm-tokens', body);
  },
  delete: (body: FCMTokenCreateDeleteRequestType) => {
    return base.delete<FCMTokenResponseType>('/fcm-tokens', { data: body });
  },
};
