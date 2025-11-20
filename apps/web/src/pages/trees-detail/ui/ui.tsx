import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useUnit } from 'effector-react';
import type React from 'react';
import {
  DeleteMemberModal,
  deleteMemberModel,
} from '~/features/tree-member/delete';
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
        renderEditMemberSlot={(member) => (
          <Button
            type="primary"
            icon={<EditOutlined />}
            block
            size="large"
            onClick={() => editMemberModel.editTriggered(member)}
          >
            Edit Member
          </Button>
        )}
        renderDeleteMemberSlot={(member) => (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            block
            size="large"
            onClick={() => deleteMemberModel.deleteTriggered(member)} // should trigger event
          >
            Delete Member
          </Button>
        )}
      />
      <EditMemberModal />
      <DeleteMemberModal />
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
