import axios, { AxiosError, AxiosResponse } from 'axios';
import { ZodIssue } from 'zod';
import { messageApi } from '~/shared/lib/antd/message';

const successMessages: Record<string, string> = {
  post: 'Created successfully',
  put: 'Updated successfully',
  patch: 'Updated successfully',
  delete: 'Deleted successfully',
};

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: ZodIssue[];
  error?: string;
}

export const base = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

base.interceptors.response.use(
  (response: AxiosResponse) => {
    const method = response.config.method?.toLowerCase();

    if (method && successMessages[method] && response.config.url !== '/files/tree') {
      messageApi.success(successMessages[method]);
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const res = error.response?.data;
    let errorMsg = 'Something went wrong';

    if (res?.errors?.length) {
      errorMsg = res.errors.map(err => err.message).join('\n');
    } else if (res?.message) {
      errorMsg = res.message;
    } else if (error.message) {
      errorMsg = error.message;
    }

    messageApi.error(errorMsg);

    return Promise.reject(error);
  }
);
