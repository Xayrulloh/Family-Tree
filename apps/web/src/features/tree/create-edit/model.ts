import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  split,
} from 'effector';
import { createDisclosure } from '../../../shared/lib/disclosure';
import { createForm } from '../../../shared/lib/create-form';
import { z } from 'zod';
import { api } from '../../../shared/api';
import { RcFile } from 'antd/es/upload';
import { or } from 'patronum';

export type FormValues = z.infer<typeof formSchema>;

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Required field' }),
  image: z
    .string()
    .nullable()
    .refine((value) => value !== 'null', 'Image is required'),
  public: z.boolean(),
});

export const DEFAULT_VALUES: FormValues = {
  name: '',
  image: null as unknown as FormValues['image'],
  public: false,
};

export const editTriggered = createEvent();
export const createTriggered = createEvent();
export const formValidated = createEvent();
export const reset = createEvent();
export const uploaded = createEvent<RcFile>();
export const created = createEvent();

export const disclosure = createDisclosure();
export const $mode = createStore<'create' | 'edit'>('create');
export const $file = createStore<RcFile | null>(null);
export const form = createForm<FormValues>();

$mode.on(createTriggered, () => 'create').on(editTriggered, () => 'edit');

const uploadImageFx = attach({
  source: $file,
  effect: (file) => {
    if (!file) {
      throw new Error('Local: no file');
    }

    const formData = new FormData();

    formData.append('file', file);

    return api.file.upload('tree', formData);
  },
});

const createTreeFx = attach({
  source: form.$formValues,
  effect: (body, path?: string) =>
    api.tree.create({
      name: body.name,
      public: body.public,
      image: path ?? null,
    }),
});

const setImgToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, file: RcFile) => {
    const preview = URL.createObjectURL(file);
    console.log(preview);

    instance?.setValue('image', preview);
  },
});

export const $mutating = or(uploadImageFx.pending, createTreeFx.pending);
export const mutated = createTreeFx.done;

sample({
  clock: [editTriggered, createTriggered],
  target: disclosure.opened,
});

split({
  source: formValidated,
  match: $mode,
  cases: {
    create: created,
  },
});

sample({
  clock: created,
  source: form.$formValues,
  filter: (values) => !!values.image,
  target: uploadImageFx,
});

sample({
  clock: created,
  source: form.$formValues,
  filter: (values) => !values.image,
  fn: () => undefined,
  target: createTreeFx,
});

sample({
  clock: uploadImageFx.doneData,
  fn: (response) => response.data.path,
  target: createTreeFx,
});

sample({
  clock: uploaded,
  target: [setImgToFormFx, $file],
});

sample({
  clock: [reset, mutated],
  target: [disclosure.closed, $mode.reinit],
});

sample({
  clock: disclosure.closed,
  target: [form.resetFx.prepend(() => DEFAULT_VALUES), $file.reinit],
});
