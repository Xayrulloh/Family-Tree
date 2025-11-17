import { useUnit } from 'effector-react';
import type React from 'react';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { PageLoading } from '~/shared/ui/loading';
import { factory } from '../model';
import { Visualization } from './visualization';
import { PreviewMemberModal } from '~/features/tree-member/preview';
import { Button } from 'antd';
import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';

// Types
type Model = ReturnType<typeof factory>;
export type Props = LazyPageProps<Model>;

export const FamilyTreeView: React.FC<Props> = ({ model }) => {
  const [loading] = useUnit([model.$loading]);

  if (loading) return <PageLoading />;

  return (
    <>
      <Visualization model={model} />
      <PreviewMemberModal
        editMemberSlot={
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            size="large"
            // onClick={() => onEditMember?.(member)}
          >
            Edit Member
          </Button>
        }
        deleteMemberSlot={
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            block
            size="large"
            // onClick={() => onDeleteMember?.(member)}
          >
            Delete Member
          </Button>
        }
        editConnectionSlot={
          <Button
            icon={<LinkOutlined />}
            block
            size="large"
            // onClick={() => onEditConnection?.(member)}
          >
            Edit Connections
          </Button>
        }
      />
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
