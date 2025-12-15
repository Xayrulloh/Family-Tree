import { UploadOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Divider, Flex, Input, Modal, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import { useUnit } from 'effector-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FieldWrapper } from '~/shared/ui/field-wrapper';
import * as model from './model';

export const EditMemberModal: React.FC = () => {
  const [isOpen, mutating] = useUnit([
    model.disclosure.$isOpen,
    model.$mutating,
  ]);

  const form = useForm({
    resolver: zodResolver(model.formSchema),
    defaultValues: model.DEFAULT_VALUES,
  });

  model.form.useBindFormWithModel({ form });

  const formId = useId();
  const member = form.getValues();

  return (
    <Modal
      open={isOpen}
      title="Edit Member"
      onCancel={() => model.disclosure.closed()}
      okText="Save Changes"
      okButtonProps={{ htmlType: 'submit', form: formId, loading: mutating }}
      width={480}
      centered
      destroyOnHidden
    >
      <form
        onSubmit={form.handleSubmit(() => model.formValidated())}
        id={formId}
      >
        <Flex vertical gap={8}>
          {/* === NAME === */}
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <FieldWrapper
                label="Full Name"
                isError={!!form.formState.errors.name?.message}
                message={form.formState.errors.name?.message?.toString()}
              >
                <Input {...field} placeholder="Enter full name" />
              </FieldWrapper>
            )}
          />

          {/* === BIRTHDATE === */}
          <Controller
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FieldWrapper
                label="Birthdate"
                isError={!!form.formState.errors.dob?.message}
                message={form.formState.errors.dob?.message?.toString()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select birthdate"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(_date, dateString) => field.onChange(dateString)}
                />
              </FieldWrapper>
            )}
          />

          {/* === DEATH DATE IF EXISTS === */}
          <Controller
            control={form.control}
            name="dod"
            render={({ field }) => (
              <FieldWrapper
                label="Death Date (optional)"
                isError={!!form.formState.errors.dod?.message}
                message={form.formState.errors.dod?.message?.toString()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select death date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(_date, dateString) => field.onChange(dateString)}
                />
              </FieldWrapper>
            )}
          />

          <Divider style={{ margin: '4px 0' }} />

          {/* === IMAGE UPLOAD === */}
          <Flex vertical gap={12}>
            {member.image && (
              <img
                src={member.image}
                alt="Profile preview"
                height={160}
                style={{
                  maxHeight: 160,
                  objectFit: "cover",
                  borderRadius: "50%",
                  display: "block",
                  margin: "0 auto",
                  aspectRatio: "1/1"
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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
            </Upload>
          </Flex>

          {/* === DESCRIPTION === */}
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <FieldWrapper
                label="About"
                isError={!!form.formState.errors.description?.message}
                message={form.formState.errors.description?.message?.toString()}
              >
                <Input.TextArea
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  rows={4}
                  placeholder="Write something about this family member..."
                />
              </FieldWrapper>
            )}
          />
        </Flex>
      </form>
    </Modal>
  );
};
