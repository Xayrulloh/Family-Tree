import { useUnit } from 'effector-react';
import * as model from './model';
import { Button, Flex, Input, Modal, Switch, Upload } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { FieldWrapper } from '../../../shared/ui/field-wrapper';
import { RcFile } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';

export const CreateEditTreeModal: React.FC = () => {
  const [mode, isOpen, mutating] = useUnit([
    model.$mode,
    model.disclosure.$isOpen,
    model.$mutating,
  ]);

  const form = useForm({
    resolver: zodResolver(model.formSchema),
    defaultValues: model.DEFAULT_VALUES,
  });

  model.form.useBindFormWithModel({ form });
  const formId = useId();

  const img = form.getValues().image;

  return (
    <Modal
      open={isOpen}
      title={mode === 'create' ? 'Tree creation' : 'Tree editing'}
      onCancel={() => model.disclosure.closed()}
      okButtonProps={{ htmlType: 'submit', form: formId, loading: mutating }}
    >
      <form
        onSubmit={form.handleSubmit(() => model.formValidated())}
        id={formId}
      >
        <Flex vertical>
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
              model.uploaded(file as RcFile);
              setTimeout(() => onSuccess?.('ok'), 0);
            }}
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>

          {img && (
            <img
              src={img}
              alt="Preview"
              style={{ maxHeight: 160, objectFit: 'contain' }}
            />
          )}
        </Flex>
      </form>
    </Modal>
  );
};
