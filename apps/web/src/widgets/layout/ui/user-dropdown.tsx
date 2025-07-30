import { Dropdown, MenuProps, Avatar, Typography, Spin, Space } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { UserGenderEnum } from '@family-tree/shared';
import { userModel } from '~/entities/user';
import { editProfileModel } from '~/features/user/edit';
import { $theme, themeToggled } from '~/app/model';

export const UserDropdown = () => {
  const [user, logout, theme] = useUnit([
    userModel.$user,
    userModel.loggedOut,
    $theme,
  ]);

  if (!user) {
    return <Spin size="small" />;
  }

  const avatarSource = user.image || `https://api.dicebear.com/9.x/lorelei/svg`;

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case UserGenderEnum.MALE:
        return <ManOutlined style={{ color: '#1890ff' }} />;
      case UserGenderEnum.FEMALE:
        return <WomanOutlined style={{ color: '#eb2f96' }} />;
      default:
        return false;
    }
  };

  const userGenderIcon = getGenderIcon(user.gender);

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '5px 0',
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
          {/* Gender and Birthdate */}
          {(userGenderIcon || user.birthdate) && (
            <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
              {user.gender && userGenderIcon && (
                <Space>
                  {userGenderIcon}
                  <Typography.Text style={{ fontSize: 12 }}>
                    {user.gender}
                  </Typography.Text>
                </Space>
              )}
              {user.birthdate && (
                <Space>
                  <CalendarOutlined />
                  <Typography.Text style={{ fontSize: 12 }}>
                    {user.birthdate}
                  </Typography.Text>
                </Space>
              )}
            </Space>
          )}
        </div>
      ),
      style: { pointerEvents: 'none' },
    },
    {
      type: 'divider',
    },
    {
      key: 'random-avatar',
      label: (
        <div
          onClick={() => editProfileModel.randomAvatarTriggered()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span role="img" aria-label="dice">
            🎲
          </span>
          Random Avatar
        </div>
      ),
    },
    {
      key: 'edit-profile',
      label: (
        <div
          onClick={() =>
            editProfileModel.editTriggered({
              name: user.name,
              image: user.image as string,
              gender: user.gender as [
                UserGenderEnum.MALE,
                UserGenderEnum.FEMALE,
              ][number],
              birthdate: user.birthdate,
            })
          }
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <EditOutlined />
          Edit Profile
        </div>
      ),
    },
    {
      key: 'dark-mode',
      label: (
        <div
          onClick={() => themeToggled()}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <BulbOutlined />
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </div>
      ),
    },
    {
      key: 'logout',
      label: (
        <div
          onClick={() => logout()}
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
