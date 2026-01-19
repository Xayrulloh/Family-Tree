import type { SharedFamilyTreeUserResponseType } from '@family-tree/shared';
import {
  Avatar,
  Button,
  Card,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useUnit } from 'effector-react';
import type React from 'react';
import { editSharedTreeModel } from '~/features/shared-tree-users/edit';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { PageLoading } from '~/shared/ui/loading';
import { factory } from '../model';

const { Title, Text } = Typography;

// Types
type Model = ReturnType<typeof factory>;
export type Props = LazyPageProps<Model>;

const SharedTreeUsers: React.FC<Props> = ({ model }) => {
  const [users, loading, mutating] = useUnit([
    model.$users,
    model.$loading,
    editSharedTreeModel.$mutating,
  ]);

  if (loading) {
    return <PageLoading />;
  }

  const columns: ColumnsType<SharedFamilyTreeUserResponseType> = [
    {
      title: 'User',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar src={record.image}>{record.name?.[0]}</Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </Space>
          {record.isBlocked && <Tag color="error">Blocked</Tag>}
        </Space>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Space size="large">
          <Space direction="vertical" size="small" align="center">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Add Members
            </Text>
            <Switch
              checked={record.canAddMembers}
              disabled={record.isBlocked || mutating}
              onChange={(checked) =>
                editSharedTreeModel.editTrigger({
                  ...record,
                  canAddMembers: checked,
                })
              }
            />
          </Space>
          <Space direction="vertical" size="small" align="center">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Edit Members
            </Text>
            <Switch
              checked={record.canEditMembers}
              disabled={record.isBlocked || mutating}
              onChange={(checked) =>
                editSharedTreeModel.editTrigger({
                  ...record,
                  canEditMembers: checked,
                })
              }
            />
          </Space>
          <Space direction="vertical" size="small" align="center">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Delete Members
            </Text>
            <Switch
              checked={record.canDeleteMembers}
              disabled={record.isBlocked || mutating}
              onChange={(checked) =>
                editSharedTreeModel.editTrigger({
                  ...record,
                  canDeleteMembers: checked,
                })
              }
            />
          </Space>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button
          danger={!record.isBlocked}
          type={record.isBlocked ? 'default' : 'primary'}
          loading={mutating}
          onClick={() =>
            editSharedTreeModel.editTrigger({
              ...record,
              isBlocked: !record.isBlocked,
            })
          }
        >
          {record.isBlocked ? 'Unblock Access' : 'Block Access'}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card variant="outlined" className="shadow-sm">
        <div className="mb-6">
          <Title level={3} style={{ margin: 0 }}>
            Shared Users
          </Title>
          <Text type="secondary">
            Manage permissions for users who have access to this family tree.
          </Text>
        </div>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="userId"
          pagination={false}
          className="border border-gray-100 rounded-lg overflow-hidden"
        />
      </Card>
    </div>
  );
};

export const component = SharedTreeUsers;
export const createModel = factory;
