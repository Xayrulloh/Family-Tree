import { GoogleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import * as model from '../model';

export const Auth: React.FC = () => {
  return (
    <div
      className="auth"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: '#f5f5f5',
        padding: '20px',
      }}
    >
      <Button
        type="primary"
        onClick={() => model.googleLoginFx()}
        style={{
          width: '30%',
          height: '7%',
          borderRadius: '50px',
          fontSize: '16px',
          backgroundColor: 'white',
          color: 'rgba(0, 0, 0, 0.87)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '25%',
          boxShadow: '0 2px 4px 0 rgba(0,0,0,0.25)',
          border: '1px solid #dadce0',
          padding: '0 24px',
          position: 'relative',
        }}
      >
        <GoogleOutlined style={{ color: '#4285F4', fontSize: '20px' }} />
        Sign in with Google
      </Button>
    </div>
  );
};