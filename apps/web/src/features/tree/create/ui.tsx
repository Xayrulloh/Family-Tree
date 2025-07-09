import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';
import { useUnit } from 'effector-react';
import {treeCreateModel} from './index';
import { zodResolver } from '@hookform/resolvers/zod';
import { RcFile } from 'antd/es/upload';
import { TreeFormModal, useBindForm, formSchema } from '../form/index'

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
    mode: 'onChange',
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

      <FormProvider {...form}>
        <TreeFormModal
          open={isOpen}
          title="Create New Tree"
          onClose={treeCreateModel.disclosure.closed}
          onSubmit={() => treeCreateModel.formValidated()}
          onUpload={handleUpload}
          img={imgPreview}
          submitting={isCreating}
        />
      </FormProvider>
    </>
  );
};
