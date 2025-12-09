import { message } from 'antd';
import { attach, createEvent, createStore, sample } from 'effector';
import { createGate, useGate } from 'effector-react';

type MessageInstance = ReturnType<typeof message.useMessage>[0];

const Gate = createGate<MessageInstance>();

export const onSuccess =
  createEvent<Parameters<MessageInstance['success']>[0]>();

export const $messageApi = createStore<MessageInstance | null>(null);

export const errorFx = attach({
  source: $messageApi,
  effect: (messageApi, payload: Parameters<MessageInstance['error']>[0]) =>
    messageApi?.error(payload),
});

export const successFx = attach({
  source: $messageApi,
  effect: (messageApi, payload: Parameters<MessageInstance['success']>[0]) =>
    messageApi?.success(payload),
});

export const infoFx = attach({
  source: $messageApi,
  effect: (messageApi, payload: Parameters<MessageInstance['info']>[0]) =>
    messageApi?.info(payload),
});

sample({
  clock: Gate.open,
  target: $messageApi,
});

export const useMessageApi = () => {
  const [messageApi, contextHolder] = message.useMessage();

  useGate(Gate, messageApi);

  return contextHolder;
};
