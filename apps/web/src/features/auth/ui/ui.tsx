import { GoogleOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';

import * as model from '../model';

export const Auth: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div
      className="flex justify-center items-center h-screen w-full px-4"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <Button
        type="default"
        onClick={() => model.googleLoginFx()}
        className="flex items-center justify-center"
        style={{
          width: '80%',
          maxWidth: '400px',
          minWidth: '280px',
          height: '52px',
          minHeight: '40px',
          borderRadius: '50px',
          fontSize: '16px',
          backgroundColor: token.colorBgElevated,
          color: token.colorText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '25%',
          boxShadow: token.boxShadowSecondary,
          border: `1px solid ${token.colorBorder}`,
          padding: '0 24px',
          position: 'relative',
        }}
      >
        <GoogleOutlined style={{ color: '#4285F4', fontSize: '20px' }} />
        Enter using Google
      </Button>
    </div>
  );
};
