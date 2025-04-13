import { UserResponseType, UserUpdateRequestType } from '@family-tree/shared';
import { base } from './base';
import { AxiosRequestConfig } from 'axios';

export const user = {
  me: (config?: AxiosRequestConfig) => {
    return base.get<UserResponseType>('/users/me', config);
  },
  findByEmail(email: string, config?: AxiosRequestConfig) {
    return base.get<UserResponseType>(`/users?email=${email}`, config);
  },
  update: (body: UserUpdateRequestType) => {
    return base.put('/users/me', body);
  }
};
