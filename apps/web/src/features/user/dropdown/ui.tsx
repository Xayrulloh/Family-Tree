import { Dropdown, MenuProps, Avatar, Typography } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { $profile } from './model';

export const UserDropdown = () => {
  const profile = useUnit($profile);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown close
    if (profile?.image) {
      window.open(profile.image, '_blank');
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown close
    window.open('/profile', 'target');
  };

  const menuItems: MenuProps['items'] = [
    // User Image Section
    {
      key: 'user-image',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '16px 0',
            cursor: profile?.image ? 'pointer' : 'default',
          }}
          onClick={handleImageClick}
        >
          <Avatar size={80} src={profile?.image} icon={<UserOutlined />} />
        </div>
      ),
    },
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '0 16px 16px' }}>
          <Typography.Title
            level={5}
            style={{
              textAlign: 'center',
              margin: '0 0 8px 0',
              fontWeight: 'bold',
            }}
          >
            {profile?.name || 'Unknown User'}
          </Typography.Title>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              color: '#666',
            }}
          >
            <span style={{ marginRight: 8, fontSize: 14 }}>⚥</span>
            <Typography.Text style={{ fontSize: 14 }}>
              {profile?.gender || 'Unknown gender'}
            </Typography.Text>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#666',
            }}
          >
            <CalendarOutlined style={{ marginRight: 8, color: '#888' }} />
            <Typography.Text>
              {profile?.birthdate
                ? new Date(profile.birthdate).toLocaleDateString()
                : 'Birthdate not set'}
            </Typography.Text>
          </div>
        </div>
      ),
      style: { pointerEvents: 'none' },
    },
    // Divider
    {
      type: 'divider',
      style: { margin: '0 0 8px 0' },
    },
    // Edit Profile
    {
      key: 'edit-profile',
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '8px 0',
            cursor: 'pointer',
          }}
          onClick={handleEditClick}
        >
          <EditOutlined style={{ marginRight: 8 }} />
          <Typography.Text>Edit Profile</Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
      }}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{
        width: 240,
        borderRadius: 8,
        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12)',
      }}
    >
      <Avatar
        size="large"
        src={profile?.image}
        icon={<UserOutlined />}
        style={{ cursor: 'pointer' }}
      />
    </Dropdown>
  );
};
