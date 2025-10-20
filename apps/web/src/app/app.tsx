import { RouterProvider } from 'atomic-router-react';
import { router } from '~/shared/config/routing';
import { appStarted } from '~/shared/config/system';
import './model';
import { ConfigProvider, theme } from 'antd';
import { useUnit } from 'effector-react';
import { Routing } from '~/pages';
import { useMessageApi } from '~/shared/lib/message';
import { $theme } from './model';
// import '../styles.css';

appStarted();

export const App: React.FC = () => {
  const currentTheme = useUnit($theme);
  const contextHolder = useMessageApi();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <RouterProvider router={router}>
        <Routing />
      </RouterProvider>
      {contextHolder}
    </ConfigProvider>
  );
};
