import { useState, useEffect } from 'react';
import { Dropdown, MenuProps, Avatar, Typography, Input, Button, DatePicker, Select } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useUnit } from 'effector-react';
import { $profile, $isEditing, profileEditStarted, profileEditCancelled, profileUpdated } from './model';
import dayjs from 'dayjs';
import { UserSchemaType } from '@family-tree/shared';

const { Text } = Typography;
const { Option } = Select;

export const UserDropdown = () => {
  const [profile, isEditing] = useUnit([$profile, $isEditing]);
  const [editedProfile, setEditedProfile] = useState<Partial<UserSchemaType>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize editedProfile when profile changes
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name,
        gender: profile.gender,
        birthdate: profile.birthdate,
        image: profile.image
      });
    }
  }, [profile]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.image) {
      window.open(profile.image, '_blank');
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    profileEditStarted();
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    profileUpdated(editedProfile);
    setIsLoading(false);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    profileEditCancelled();
  };

  const handleFieldChange = (field: keyof UserSchemaType, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
          <Avatar size={80} src={editedProfile.image} icon={<UserOutlined />} />
        </div>
      ),
    },
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '0 16px 16px' }}>
          {isEditing ? (
            <Input
              value={editedProfile.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              style={{ marginBottom: 16, textAlign: 'center' }}
              placeholder="Enter your name"
            />
          ) : (
            <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
              {profile?.name || 'Unknown User'}
            </Text>
          )}

          <div style={{ marginBottom: 8 }}>
            {isEditing ? (
              <Select
                value={editedProfile.gender}
                onChange={(value) => handleFieldChange('gender', value)}
                style={{ width: '100%' }}
                placeholder="Select gender"
              >
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
              </Select>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                <span style={{ marginRight: 8, fontSize: 14 }}>⚥</span>
                <Text>{profile?.gender || 'Unknown gender'}</Text>
              </div>
            )}
          </div>

          <div>
            {isEditing ? (
              <DatePicker
                style={{ width: '100%' }}
                value={editedProfile.birthdate ? dayjs(editedProfile.birthdate) : null}
                onChange={(date) => handleFieldChange('birthdate', date ? date.format('YYYY-MM-DD') : '')}
                placeholder="Select birthdate"
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
                <CalendarOutlined style={{ marginRight: 8, color: '#888' }} />
                <Text>
                  {profile?.birthdate
                    ? new Date(profile.birthdate).toLocaleDateString()
                    : 'Birthdate not set'}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      type: 'divider',
      style: { margin: '0 0 8px 0' },
    },
    // Edit/Save Profile
    {
      key: 'edit-profile',
      label: isEditing ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
          <Button
            type="text"
            danger
            icon={<CloseOutlined />}
            onClick={handleCancelClick}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveClick}
            loading={isLoading}
          >
            Save
          </Button>
        </div>
      ) : (
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
          <Text>Edit Profile</Text>
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
        width: 280,
        borderRadius: 8,
        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12)',
      }}
      open={isEditing ? true : undefined}
      onOpenChange={(open) => {
        if (!open && isEditing) {
          // Don't allow closing when editing
          return;
        }
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