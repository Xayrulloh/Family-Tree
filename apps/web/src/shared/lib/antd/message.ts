import { message } from 'antd';

let api: ReturnType<typeof message.useMessage>[0];

export const messageApi = {
  success: (msg: string) => api?.success(msg),
  error: (msg: string) => api?.error(msg),
  info: (msg: string) => api?.info(msg),
  warning: (msg: string) => api?.warning(msg),
  _init: (instance: typeof api) => {
    api = instance;
  },
};

export const createMessageContextHolder = () => {
  const [apiInstance, contextHolder] = message.useMessage();
  messageApi._init(apiInstance);
  return contextHolder;
};
