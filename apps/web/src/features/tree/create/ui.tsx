// features/tree/create/ui.tsx
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useForm } from 'react-hook-form';
import { useUnit } from 'effector-react';

import {
  TreeFormModal,
  useBindForm,
  formSchema,
} from '../../../features/tree/form';
import { treeCreateModel } from './index';
import { zodResolver } from '@hookform/resolvers/zod';
import { RcFile } from 'antd/es/upload';

export const CreateTree = () => {
  const [isOpen, isCreating, imgPreview] = useUnit([
    treeCreateModel.disclosure.$isOpen,
    treeCreateModel.$treeCreating,
    treeCreateModel.$imgPreview,
  ]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      image: '',
      public: false,
    },
  });

  useBindForm({ form });

  const handleUpload = async (file: RcFile) => {
    const preview = URL.createObjectURL(file);

    treeCreateModel.setImagePreview(preview);

    await treeCreateModel.uploadImageFx(file);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => treeCreateModel.disclosure.opened()}
      >
        Create
      </Button>

      <TreeFormModal
        open={isOpen}
        title="Create New Tree"
        onClose={treeCreateModel.disclosure.closed}
        onSubmit={() =>
          form.handleSubmit(() => treeCreateModel.formValidated())()
        }
        onUpload={handleUpload}
        img={imgPreview}
        submitting={isCreating}
      />
    </>
  );
};
