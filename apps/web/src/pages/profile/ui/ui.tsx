import { Card, Typography, Avatar, Button, Flex, Space } from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  ManOutlined,
  QuestionOutlined,
  UserOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { $user } from '~/entities/user/model';
import { factory } from '../model';
import { UserGenderEnum, UserSchemaType } from '@family-tree/shared';

export const ProfilePage: React.FC = () => {
  const user = useUnit($user);

  if (!user) {
    return (
      <Flex justify="center" align="center" style={{ padding: '64px 0' }}>
        <Typography.Text type="secondary">Loading profile...</Typography.Text>
      </Flex>
    );
  }

  const { name, email, image, gender, birthdate = 'Not specified' } = user;

  const getGenderIcon = (gender: UserSchemaType['gender']) => {
    switch (gender) {
      case 'MALE' as UserGenderEnum.MALE:
        return <ManOutlined style={{ color: '#1890ff' }} />;
      case 'FEMALE' as UserGenderEnum.FEMALE:
        return <WomanOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <QuestionOutlined style={{ color: '#999' }} />;
    }
  };

  return (
    <Flex justify="center" style={{ padding: 32 }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 600,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Flex vertical gap="large" align="center">
          {/* Avatar and Name */}
          <Flex vertical align="center" gap={8}>
            <Avatar
              size={96}
              src={image}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#f0f0f0' }}
            />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {name}
            </Typography.Title>
            <Typography.Text type="secondary">{email}</Typography.Text>
          </Flex>

          {/* User Info */}
          <Space
            direction="vertical"
            style={{ width: '100%', gap: 12 }}
            size="large"
            align="center"
          >
            {/* Gender */}
            <Flex
              align="center"
              justify="space-between"
              style={{ width: '100%', gap: 12 }}
            >
              <Space>
                {getGenderIcon(gender)}
                <Typography.Text strong>Gender</Typography.Text>
              </Space>
              <Typography.Text>{gender || 'Not specified'}</Typography.Text>
            </Flex>

            {/* Birthdate */}
            <Flex
              align="center"
              justify="space-between"
              style={{ width: '100%', gap: 12 }}
            >
              <Space>
                <CalendarOutlined />
                <Typography.Text strong>Birthdate</Typography.Text>
              </Space>
              <Typography.Text>{birthdate || 'Not specified'}</Typography.Text>
            </Flex>
          </Space>

          {/* Edit Button */}
          <Button type="primary" icon={<EditOutlined />} size="middle">
            Edit Profile
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
};

export const component = ProfilePage;
export const createModel = factory;
