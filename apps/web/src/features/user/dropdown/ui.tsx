import { Dropdown, MenuProps, Avatar, Typography, Spin } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { $user } from './model';

export const UserDropdown = () => {
  const user = useUnit($user);

  if (!user) {
    return <Spin size="small" />;
  }

  const avatarSource = user.image || `https://api.dicebear.com/9.x/lorelei/svg`;

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0 12px',
          }}
        >
          <Avatar
            size={64}
            src={avatarSource}
            icon={<UserOutlined />}
            style={{ marginBottom: 8 }}
          />
          <Typography.Text strong>{user.name}</Typography.Text>
          {user.email && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Typography.Text>
          )}
        </div>
      ),
      style: { pointerEvents: 'none' },
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      label: (
        <div
          onClick={() => window.open('/profile', '_self')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <SettingOutlined />
          Profile
        </div>
      ),
    },
    {
      key: 'dark-mode',
      label: (
        <div
          onClick={() => console.log('Dark mode clicked')}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <BulbOutlined />
          Dark Mode
        </div>
      ),
    },
    {
      key: 'logout',
      label: (
        <div
          onClick={() => console.log('Logout clicked')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'red',
          }}
        >
          <LogoutOutlined />
          Logout
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{
        width: 240,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      }}
    >
      <Avatar
        size="large"
        src={avatarSource}
        icon={<UserOutlined />}
        style={{ cursor: 'pointer' }}
      />
    </Dropdown>
  );
};
