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
import { PageLoading } from '~/shared/ui/loading';
import type { TreeDetailModel } from './model';
import { Visualization } from './visualization';

type Props = { model: TreeDetailModel };

/**
 * Shared tree-detail view used by the owner, shared, and public pages. Edit /
 * delete actions are gated purely on the normalized `$permissions`.
 */
export const TreeDetailView: React.FC<Props> = ({ model }) => {
  const [loading, permissions] = useUnit([model.$loading, model.$permissions]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <Visualization model={model} />
      <PreviewMemberModal
        renderEditMemberSlot={(member) =>
          permissions.canEdit && (
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: 18 }} />}
              onClick={() => editMemberModel.editTrigger(member)}
            />
          )
        }
        renderDeleteMemberSlot={(member) =>
          permissions.canDelete && (
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
