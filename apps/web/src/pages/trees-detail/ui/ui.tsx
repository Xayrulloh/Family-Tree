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
  const [loading, isOwner] = useUnit([model.$loading, model.$isOwner]);

  if (loading) {return <PageLoading />;}

  return (
    <>
      <Visualization model={model} />
      <PreviewMemberModal
        renderEditMemberSlot={(member) =>
          isOwner && (
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: 18 }} />}
              onClick={() => editMemberModel.editTrigger(member)}
            />
          )
        }
        renderDeleteMemberSlot={(member) =>
          isOwner && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined style={{ fontSize: 18 }} />}
              onClick={() => deleteMemberModel.deleteTrigger(member)}
            />
          )
        }
      />
      <EditMemberModal />
      <DeleteMemberModal />
    </>
  );
};

export const component = FamilyTreeView;
export const createModel = factory;
