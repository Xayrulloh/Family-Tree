import {
  BulbOutlined,
  CalendarOutlined,
  EditOutlined,
  LogoutOutlined,
  ManOutlined,
  UserOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { UserGenderEnum } from '@family-tree/shared';
import {
  Avatar,
  Dropdown,
  type MenuProps,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useUnit } from 'effector-react';
import { $theme, themeToggled } from '~/app/model';
import { userModel } from '~/entities/user';
import { editProfileModel } from '~/features/user/edit';

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
        <div className="flex flex-col items-center py-2 pointer-events-none">
          <Avatar
            size={64}
            src={avatarSource}
            icon={<UserOutlined />}
            className="mb-2"
          />
          <Typography.Text strong>{user.name}</Typography.Text>
          {user.email && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Typography.Text>
          )}
          {/* Gender and Birthdate */}
          {(userGenderIcon || user.birthdate) && (
            <Space direction="vertical" size={4} className="mt-2">
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
          onKeyDown={(_e) => {}}
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
          onKeyDown={(_e) => {}}
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
          onKeyDown={(_e) => {}}
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
          onKeyDown={(_e) => {}}
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
