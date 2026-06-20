import { Button, Modal, Spin, Typography } from 'antd';
import { useUnit } from 'effector-react';
import * as model from './model';

export const DeleteMemberModal: React.FC = () => {
  const [isOpen, mutating, previewLoading, preview, member] = useUnit([
    model.disclosure.$isOpen,
    model.$mutating,
    model.$previewLoading,
    model.$preview,
    model.$member,
  ]);

  const canDelete = preview?.canDelete ?? false;

  return (
    <Modal
      open={isOpen}
      title="Delete Member"
      centered
      onCancel={() => model.disclosure.closed()}
      destroyOnHidden
      footer={
        previewLoading || !preview
          ? null
          : canDelete
            ? [
                <Button key="cancel" onClick={() => model.disclosure.closed()}>
                  Cancel
                </Button>,
                <Button
                  key="delete"
                  danger
                  type="primary"
                  loading={mutating}
                  onClick={() => model.deleted()}
                >
                  Delete
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => model.disclosure.closed()}>
                  Close
                </Button>,
              ]
      }
    >
      {previewLoading || !preview ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Spin />
        </div>
      ) : canDelete ? (
        <>
          <Typography.Text>
            Are you sure you want to delete <strong>{member?.name}</strong>?
          </Typography.Text>
          {preview.spouseToDelete && (
            <Typography.Paragraph
              type="warning"
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              Their spouse <strong>{preview.spouseToDelete.name}</strong> will
              also be deleted.
            </Typography.Paragraph>
          )}
        </>
      ) : (
        <Typography.Text type="danger">{preview.blockReason}</Typography.Text>
      )}
    </Modal>
  );
};
