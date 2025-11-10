import { Suspense } from 'react';
import { FullscreenLoading } from '~/shared/ui/loading';

const WithSuspense = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<FullscreenLoading />}>{children}</Suspense>;
};

export const withSuspense = (Component: React.FC) => {
  return () => (
    <WithSuspense>
      <Component />
    </WithSuspense>
  );
};
