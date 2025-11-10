import { Flex, Spin } from 'antd';
import { Suspense } from 'react';

const WithSuspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <Flex
          justify="center"
          align="center"
          style={{ height: '100vh', width: '100%' }}
        >
          <Spin size="large" />
        </Flex>
      }
    >
      {children}
    </Suspense>
  );
};

export const withSuspense = (Component: React.FC) => {
  return () => (
    <WithSuspense>
      <Component />
    </WithSuspense>
  );
};
