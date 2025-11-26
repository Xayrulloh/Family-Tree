import { Modal, Typography } from 'antd';
import { useUnit } from 'effector-react';
import * as model from './model';

export const DeleteMemberModal: React.FC = () => {
  const [isOpen, mutating] = useUnit([
    model.disclosure.$isOpen,
    model.$mutating,
  ]);

  return (
    <Modal
      open={isOpen}
      title="Delete Member"
      centered
      onOk={() => model.deleted()}
      onCancel={() => model.disclosure.closed()}
      okText="Delete"
      okButtonProps={{ htmlType: 'submit', danger: true, loading: mutating }}
      destroyOnHidden
    >
      <Typography.Text>Are you sure you want to delete</Typography.Text>
    </Modal>
  );
};
