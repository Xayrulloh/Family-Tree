import { Button, Flex, Input, Modal, Switch, Upload } from 'antd';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import { RcFile } from 'antd/es/upload';
import { FormValues } from './model';
import { FieldWrapper } from '../../../shared/ui/field-wrapper';
import { UploadOutlined } from '@ant-design/icons';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  onUpload: (file: RcFile) => void;
  img: string;
  submitting: boolean;
};

export const TreeFormModal: React.FC<Props> = ({
  open,
  title,
  onClose,
  onSubmit,
  onUpload,
  img,
  submitting,
}) => {
  const form = useFormContext<FormValues>();

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      okText="Save"
      okButtonProps={{ type: 'primary', form: 'tree-form', htmlType: 'submit' }}
      confirmLoading={submitting}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} id="tree-form">
        <FormProvider {...form}>
          <Flex vertical gap={16}>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <FieldWrapper
                  label="Name"
                  isError={!!form.formState.errors.name?.message}
                  message={form.formState.errors.name?.message}
                >
                  <Input {...field} />
                </FieldWrapper>
              )}
            />

            <Controller
              control={form.control}
              name="public"
              render={({ field }) => (
                <FieldWrapper
                  label="Public"
                  isError={!!form.formState.errors.public?.message}
                  message={form.formState.errors.public?.message}
                >
                  <Switch
                    checkedChildren="Public"
                    unCheckedChildren="Private"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FieldWrapper>
              )}
            />

            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                onUpload(file as RcFile);
                setTimeout(() => onSuccess?.('ok'), 0);
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>

            {img && (
              <img
                src={img}
                alt="Tree"
                style={{ maxHeight: 160, objectFit: 'contain' }}
              />
            )}
          </Flex>
        </FormProvider>
      </form>
    </Modal>
  );
};
