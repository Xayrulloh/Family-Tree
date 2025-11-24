import { UploadOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex, Input, Modal, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { useUnit } from 'effector-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FieldWrapper } from '~/shared/ui/field-wrapper';
import * as model from './model';

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
      title={mode === 'create' ? 'Create Family Tree' : 'Edit Family Tree'}
      onCancel={() => model.disclosure.closed()}
      okButtonProps={{ htmlType: 'submit', form: formId, loading: mutating }}
      width={480}
      destroyOnHidden
    >
      {/* === 🧾 Form Start === */}
      <form
        onSubmit={form.handleSubmit(() => model.formValidated())}
        id={formId}
      >
        <Flex vertical gap={16} style={{ paddingInline: 8 }}>
          {/* === 🌳 Tree Name Input === */}
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <FieldWrapper
                label="Tree Name"
                isError={!!form.formState.errors.name?.message}
                message={form.formState.errors.name?.message}
              >
                <Input {...field} placeholder="Enter tree name" />
              </FieldWrapper>
            )}
          />

          {/* === 📤 Image Upload === */}
          <Flex vertical gap={12}>
            {/* === 🖼️ Image Preview === */}
            {img && (
              <img
                src={img}
                alt="Preview"
                style={{
                  objectFit: 'cover',
                  borderRadius: 6,
                  width: '100%',
                  height: 'auto',
                  maxHeight: 200,
                }}
              />
            )}

            {/* === 📤 Image Upload Button === */}
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
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
};
