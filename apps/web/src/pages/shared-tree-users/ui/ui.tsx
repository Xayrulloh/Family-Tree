import { Table, Typography } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { PageLoading } from '~/shared/ui/loading';
import { factory } from '../model';

const { Title } = Typography;

// Types
type Model = ReturnType<typeof factory>;
export type Props = LazyPageProps<Model>;

const SharedTreeUsers: React.FC<Props> = ({ model }) => {
  const [users, loading] = useUnit([model.$users, model.$loading]);

  if (loading) {
    return <PageLoading />;
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Add Member',
      dataIndex: 'canAddMembers',
      key: 'canAddMembers',
    },
    {
      title: 'Edit Member',
      dataIndex: 'canEditMembers',
      key: 'canEditMembers',
    },
    {
      title: 'Delete Member',
      dataIndex: 'canDeleteMembers',
      key: 'canDeleteMembers',
    },
    {
      title: 'Block',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
    },
  ];

  return (
    <div className="p-4">
      <Title level={2}>Shared Users</Title>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export const component = SharedTreeUsers;
export const createModel = factory;
