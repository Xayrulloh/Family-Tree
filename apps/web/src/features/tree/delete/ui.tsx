import { useUnit } from 'effector-react';
import * as model from './model';
import { Modal, Typography } from 'antd';

export const DeleteTreeModal: React.FC = () => {
  const [isOpen, mutating] = useUnit([
    model.disclosure.$isOpen,
    model.$mutating,
  ]);

  return (
    <Modal
      open={isOpen}
      title="Delete Tree"
      centered
      onOk={() => model.deleted()}
      onCancel={() => model.disclosure.closed()}
      okText="Delete"
      okButtonProps={{ htmlType: 'submit', danger: true, loading: mutating }}
      destroyOnClose
    >
      <Typography.Text>Are you sure you want to delete</Typography.Text>
    </Modal>
  );
};
