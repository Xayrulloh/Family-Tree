import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import { EditMemberModal, editMemberModel } from '~/features/tree-member/edit';
import { PreviewMemberModal } from '~/features/tree-member/preview';
import type { LazyPageProps } from '~/shared/lib/lazy-page';
import { PageLoading } from '~/shared/ui/loading';
import { factory } from '../model';
import { Visualization } from './visualization';

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
            onClick={() => editMemberModel} // should trigger event
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
            // onClick={() => onDeleteMember?.(member)} // should trigger event
          >
            Delete Member
          </Button>
        }
        editConnectionSlot={
          <Button
            icon={<PlusOutlined />}
            block
            size="large"
            // onClick={() => onEditConnection?.(member)} // should trigger event
          >
            Add Connections
          </Button>
        }
      />
      <EditMemberModal />
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
