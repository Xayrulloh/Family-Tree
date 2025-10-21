import {
  Drawer,
  Space,
  Button,
  Descriptions,
  Avatar,
  Tag,
  Typography,
  Divider,
} from 'antd';
import { EditOutlined, LinkOutlined, UserOutlined } from '@ant-design/icons';
import type { MemberSchemaType } from '@family-tree/shared';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

type MemberDetailDrawerProps = {
  member: MemberSchemaType | null;
  open: boolean;
  onClose: () => void;
  onEditMember?: (member: MemberSchemaType) => void;
  onEditConnection?: (member: MemberSchemaType) => void;
};

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  member,
  open,
  onClose,
  onEditMember,
  onEditConnection,
}) => {
  if (!member) return null;

  const getGenderTag = (gender: string) => {
    const config = {
      MALE: { color: 'blue', label: 'Male' },
      FEMALE: { color: 'pink', label: 'Female' },
      UNKNOWN: { color: 'default', label: 'Unknown' },
    };
    return config[gender as keyof typeof config] || config.UNKNOWN;
  };

  const getStatusTag = (dod: string | null) => {
    return dod
      ? { color: 'default', label: 'Deceased' }
      : { color: 'green', label: 'Alive' };
  };

  const genderTag = getGenderTag(member.gender);
  const statusTag = getStatusTag(member.dod);

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={40}
            src={member.image}
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                genderTag.color === 'blue' ? '#3b82f6' : '#ec4899',
            }}
          />
          <span>{member.name}</span>
        </Space>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={open}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status Tags */}
        <Space>
          <Tag color={genderTag.color}>{genderTag.label}</Tag>
          <Tag color={statusTag.color}>{statusTag.label}</Tag>
        </Space>

        {/* Basic Info */}
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Date of Birth">
            {member.dob ? dayjs(member.dob).format('MMMM D, YYYY') : 'Unknown'}
          </Descriptions.Item>
          {member.dod && (
            <Descriptions.Item label="Date of Death">
              {dayjs(member.dod).format('MMMM D, YYYY')}
            </Descriptions.Item>
          )}
          {member.dob && member.dod && (
            <Descriptions.Item label="Age at Death">
              {dayjs(member.dod).diff(dayjs(member.dob), 'year')} years
            </Descriptions.Item>
          )}
          {member.dob && !member.dod && (
            <Descriptions.Item label="Current Age">
              {dayjs().diff(dayjs(member.dob), 'year')} years
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Description */}
        {member.description && (
          <>
            <Divider />
            <div>
              <Title level={5}>About</Title>
              <Paragraph style={{ color: '#6b7280' }}>
                {member.description}
              </Paragraph>
            </div>
          </>
        )}

        {/* Metadata */}
        <Divider />
        <div style={{ fontSize: 12, color: '#9ca3af' }}>
          <Text type="secondary">
            Added: {dayjs(member.createdAt).format('MMM D, YYYY')}
          </Text>
          <br />
          <Text type="secondary">
            Updated: {dayjs(member.updatedAt).format('MMM D, YYYY')}
          </Text>
        </div>

        {/* Action Buttons */}
        <Space style={{ width: '100%', marginTop: 16 }} direction="vertical">
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            onClick={() => {
              onEditMember?.(member);
              console.log('Edit member', member.id);
            }}
          >
            Edit Member
          </Button>
          <Button
            icon={<LinkOutlined />}
            block
            onClick={() => {
              onEditConnection?.(member);
              console.log('Edit connection', member.id);
            }}
          >
            Edit Connections
          </Button>
        </Space>
      </Space>
    </Drawer>
  );
};
