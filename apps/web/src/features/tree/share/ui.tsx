import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, Modal } from 'antd';
import { useUnit } from 'effector-react';
import * as model from './model';

export const ShareTreeModal = () => {
  const [isOpen, url] = useUnit([model.disclosure.$isOpen, model.$shareUrl]);

  return (
    <Modal
      open={isOpen}
      title="Share Family Tree"
      onCancel={() => model.disclosure.closed()}
      footer={null}
      destroyOnHidden
      width={400}
    >
      <div className="flex gap-2 items-center">
        <Input value={url} readOnly />
        <Button
          icon={<CopyOutlined />}
          onClick={() => model.copyTrigger()}
          type="primary"
        >
          Copy
        </Button>
      </div>
    </Modal>
  );
};
