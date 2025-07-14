import {
  attach,
  createEvent,
  createStore,
  merge,
  sample,
  split,
} from 'effector';
import { createDisclosure } from '../../../shared/lib/disclosure';
import { createForm } from '../../../shared/lib/create-form';
import { z } from 'zod';
import { api } from '../../../shared/api';
import { RcFile } from 'antd/es/upload';
import { delay, or, spread } from 'patronum';

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

export const editTriggered = createEvent<{ id: string; values: FormValues }>();
export const createTriggered = createEvent();
export const formValidated = createEvent();
export const reset = createEvent();
export const uploaded = createEvent<RcFile>();
export const created = createEvent();
export const edited = createEvent();

export const disclosure = createDisclosure();
export const $mode = createStore<'create' | 'edit'>('create');
export const $file = createStore<RcFile | null>(null);
export const $id = createStore<string | null>(null);
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
  effect: (body) => api.tree.create(body),
});

const editTreeFx = attach({
  source: {
    values: form.$formValues,
    id: $id,
  },
  effect: ({ values, id }) => {
    if (!id) {
      throw new Error('Local: no id');
    }

    return api.tree.update(id, values);
  },
});

const setPreviewToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, file: RcFile) => {
    const preview = URL.createObjectURL(file);
    console.log(preview);

    instance?.setValue('image', preview);
  },
});

const setPathToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, path: string) => {
    return instance?.setValue('image', path);
  },
});

export const $mutating = or(
  uploadImageFx.pending,
  createTreeFx.pending,
  editTreeFx.pending
);
export const mutated = merge([createTreeFx.done, editTreeFx.done]);

sample({
  clock: [editTriggered, createTriggered],
  target: disclosure.opened,
});

split({
  source: formValidated,
  match: $mode,
  cases: {
    create: created,
    edit: edited,
  },
});

sample({
  clock: uploadImageFx.doneData,
  fn: (response) => response.data.path,
  target: setPathToFormFx,
});

split({
  source: delay(setPathToFormFx.done, 0),
  match: $mode,
  cases: {
    create: createTreeFx,
    edit: editTreeFx,
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
  clock: uploaded,
  target: [setPreviewToFormFx, $file],
});

// edit
sample({
  clock: editTriggered,
  target: spread({
    values: form.resetFx,
    id: $id,
  }),
});

sample({
  clock: edited,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('blob'),
  target: uploadImageFx,
});

sample({
  clock: edited,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('https'),
  target: editTreeFx,
});

// both logic
sample({
  clock: [reset, mutated],
  target: [disclosure.closed, $mode.reinit],
});

sample({
  clock: disclosure.closed,
  target: [
    form.resetFx.prepend(() => DEFAULT_VALUES),
    $file.reinit,
    $id.reinit,
  ],
});
