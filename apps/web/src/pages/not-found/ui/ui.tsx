import { Button, Result, theme } from 'antd';
import { routes } from '~/shared/config/routing';
import { factory } from '../model';

export const NotFoundPage = () => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: token.colorBgBase,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => routes.browse.open()}>
            Back Home
          </Button>
        }
      />
    </div>
  );
};

export const component = NotFoundPage;
export const createModel = factory;
