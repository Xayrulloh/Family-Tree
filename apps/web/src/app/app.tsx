import { appStarted } from '~/shared/config/system';
import { router } from '~/shared/config/routing';
import { RouterProvider } from 'atomic-router-react';
import './model';
import { Routing } from '~/pages';
import { ConfigProvider, theme } from 'antd';
import { $theme } from './model';
import { useUnit } from 'effector-react';
import { MessageProvider } from './providers/message-provider';

appStarted();

export const App: React.FC = () => {
  const currentTheme = useUnit($theme);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <MessageProvider />
      <RouterProvider router={router}>
        <Routing />
      </RouterProvider>
    </ConfigProvider>
  );
};
