import { UserResponseType, UserUpdateRequestType } from '@family-tree/shared';
import { base } from './base';
import { AxiosRequestConfig } from 'axios';

export const user = {
  me: (config?: AxiosRequestConfig) => {
    return base.get<UserResponseType>('/users/me', config);
  },
  findByEmail: (email: string, config?: AxiosRequestConfig) => {
    return base.get<UserResponseType>(`/users?email=${email}`, config);
  },
  update: (body: UserUpdateRequestType, config?: AxiosRequestConfig) => {
    return base.put('/users', body, config);
  },
  findById: (id: string, config?: AxiosRequestConfig) => {
    return base.get<UserResponseType>(`/users/${id}`, config);
  },
};
