import { GoogleOutlined } from '@ant-design/icons';
import { Button, theme } from 'antd';

import * as model from '../model';

export const Auth: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div
      className="auth"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: token.colorBgLayout,
        padding: '20px',
      }}
    >
      <Button
        type="default"
        onClick={() => model.googleLoginFx()}
        style={{
          width: '30%',
          height: '7%',
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
