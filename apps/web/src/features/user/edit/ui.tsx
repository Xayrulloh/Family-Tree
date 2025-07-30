import { useUnit } from 'effector-react';
import * as model from './model';
import {
  Button,
  DatePicker,
  Divider,
  Flex,
  Input,
  Modal,
  Select,
  Upload,
} from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { FieldWrapper } from '~/shared/ui/field-wrapper';
import { RcFile } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export const EditProfileModal: React.FC = () => {
  const [isOpen, mutating] = useUnit([
    model.disclosure.$isOpen,
    model.$mutating,
  ]);

  const form = useForm({
    resolver: zodResolver(model.formSchema),
  });

  model.form.useBindFormWithModel({ form });

  const formId = useId();
  const img = form.getValues().image;

  return (
    <Modal
      open={isOpen}
      title="Edit Profile"
      onCancel={() => model.disclosure.closed()}
      okButtonProps={{ htmlType: 'submit', form: formId, loading: mutating }}
      width={480}
      destroyOnHidden
    >
      <form
        onSubmit={form.handleSubmit(() => model.formValidated())}
        id={formId}
      >
        <Flex vertical gap={16}>
          {/* === 👤 Name === */}
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <FieldWrapper
                label="Name"
                isError={!!form.formState.errors.name?.message}
                message={form.formState.errors.name?.message}
              >
                <Input {...field} placeholder="Enter your name" />
              </FieldWrapper>
            )}
          />

          {/* === 🧬 Gender === */}
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FieldWrapper
                label="Gender"
                isError={!!form.formState.errors.gender?.message}
                message={form.formState.errors.gender?.message}
              >
                <Select
                  {...field}
                  options={Object.values(['MALE', 'FEMALE']).map((gender) => ({
                    label: gender,
                    value: gender,
                  }))}
                  placeholder="Select gender"
                  allowClear
                />
              </FieldWrapper>
            )}
          />

          {/* === 🎂 Birthdate === */}
          <Controller
            control={form.control}
            name="birthdate"
            render={({ field }) => (
              <FieldWrapper
                label="Birthdate"
                isError={!!form.formState.errors.birthdate?.message}
                message={form.formState.errors.birthdate?.message}
              >
                <DatePicker
                  {...field}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  allowClear
                  placeholder="Select birthdate"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date, dateString) => {
                    field.onChange(dateString || null);
                  }}
                />
              </FieldWrapper>
            )}
          />

          <Divider style={{ margin: 0 }} />

          {/* === 🖼️ Image Preview and Upload === */}
          <Flex vertical gap={12}>
            {img && (
              <img
                src={img}
                alt="Profile preview"
                height={160}
                style={{
                  maxHeight: 160,
                  maxWidth: '100%',
                  objectFit: 'cover',
                  borderRadius: 6,
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            )}

            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                model.uploaded(file as RcFile);
                setTimeout(() => onSuccess?.('ok'), 0);
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
            </Upload>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
};
