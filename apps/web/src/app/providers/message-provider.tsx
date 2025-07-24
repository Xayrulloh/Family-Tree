import { createMessageContextHolder } from '~/shared/lib/antd/message';

export const MessageProvider = () => {
  const contextHolder = createMessageContextHolder();

  return contextHolder;
};
