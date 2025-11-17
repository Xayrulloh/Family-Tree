import {
  CalendarOutlined,
  HeartFilled,
  HeartOutlined,
  ManOutlined,
  UserOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Avatar, Divider, Flex, Modal, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useUnit } from 'effector-react';
import * as model from './model';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { Title, Paragraph, Text } = Typography;

type PreviewMemberModalProps = {
  editMemberSlot?: React.ReactNode;
  deleteMemberSlot?: React.ReactNode;
  editConnectionSlot?: React.ReactNode;
};

export const PreviewMemberModal: React.FC<PreviewMemberModalProps> = ({
  editMemberSlot,
  deleteMemberSlot,
  editConnectionSlot,
}) => {
  const [isOpen] = useUnit([model.disclosure.$isOpen]);

  const form = useForm({
    resolver: zodResolver(model.formSchema),
  });

  model.form.useBindFormWithModel({ form });

  const member = form.getValues();

  // Calculate age and status
  const calculateAgeInfo = () => {
    if (!member.dob) return null;

    const birthDate = dayjs(member.dob);
    const deathDate = member.dod ? dayjs(member.dod) : null;
    const currentDate = dayjs();

    if (deathDate) {
      const ageAtDeath = deathDate.diff(birthDate, 'year');

      return {
        status: 'deceased',
        age: ageAtDeath,
        birthFormatted: birthDate.format('MMMM D, YYYY'),
        deathFormatted: deathDate.format('MMMM D, YYYY'),
      };
    } else {
      const currentAge = currentDate.diff(birthDate, 'year');

      return {
        status: 'alive',
        age: currentAge,
        birthFormatted: birthDate.format('MMMM D, YYYY'),
      };
    }
  };

  const ageInfo = calculateAgeInfo();

  return (
    <Modal
      open={isOpen}
      onCancel={() => model.disclosure.closed()}
      width={480}
      centered
      footer={null}
      destroyOnHidden
    >
      {/* Header - Centered */}
      <Flex vertical align="center" gap={15} style={{ marginBottom: 24 }}>
        <Avatar
          size={80}
          src={member.image}
          icon={<UserOutlined />}
          style={{
            backgroundColor: member.gender === 'MALE' ? '#3b82f6' : '#ec4899',
            border: `3px solid ${member.gender === 'MALE' ? '#3b82f6' : '#ec4899'}`,
          }}
        />
        <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {member.name}
        </Title>
      </Flex>

      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Gender Information */}
        <Flex justify="space-between" align="center">
          <Text strong>Gender</Text>
          <Space>
            {member.gender === 'MALE' ? (
              <ManOutlined style={{ color: '#3b82f6', fontSize: 16 }} />
            ) : (
              <WomanOutlined style={{ color: '#ec4899', fontSize: 16 }} />
            )}
            <Text>{member.gender === 'MALE' ? 'Male' : 'Female'}</Text>
          </Space>
        </Flex>

        {/* Date of Birth & Age */}
        {ageInfo && (
          <Flex justify="space-between" align="center">
            <Text strong>Date of Birth</Text>
            <Space direction="vertical" size={2} align="end">
              <Space>
                <CalendarOutlined style={{ color: '#6b7280' }} />
                <Text>{ageInfo.birthFormatted}</Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {ageInfo.age} years
                {ageInfo.status === 'alive' ? ' old' : ' at death'}
              </Text>
            </Space>
          </Flex>
        )}

        {/* Living Status */}
        <Flex justify="space-between" align="center">
          <Text strong>Status</Text>
          <Space>
            {ageInfo?.status === 'alive' ? (
              <>
                <HeartFilled style={{ color: '#10b981', fontSize: 16 }} />
                <Text type="success">Alive</Text>
              </>
            ) : ageInfo?.status === 'deceased' ? (
              <>
                <HeartOutlined style={{ color: '#6b7280', fontSize: 16 }} />
                <Text type="secondary">Deceased</Text>
                {ageInfo.deathFormatted && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({ageInfo.deathFormatted})
                  </Text>
                )}
              </>
            ) : (
              <>
                <HeartOutlined style={{ color: '#9ca3af', fontSize: 16 }} />
                <Text type="secondary">Unknown</Text>
              </>
            )}
          </Space>
        </Flex>

        {/* Description */}
        {member.description && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div>
              <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>
                About
              </Title>
              <Paragraph italic style={{ color: '#6b7280', margin: 0 }}>
                {member.description}
              </Paragraph>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <Space
          direction="vertical"
          style={{ width: '100%', marginTop: 8 }}
          size={8}
        >
          <Flex gap={12} style={{ width: '100%' }}>
            {editMemberSlot}
            {deleteMemberSlot}
          </Flex>
          {editConnectionSlot}
        </Space>
      </Space>
    </Modal>
  );
};
