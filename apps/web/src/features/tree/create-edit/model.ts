import {
  attach,
  createEvent,
  createStore,
  merge,
  sample,
  split,
} from 'effector';
import { createDisclosure } from '~/shared/lib/disclosure';
import { createForm } from '~/shared/lib/create-form';
import { z } from 'zod';
import { api } from '~/shared/api';
import { RcFile } from 'antd/es/upload';
import { delay, or, spread } from 'patronum';
import { FileUploadFolderEnum } from '@family-tree/shared';

// Base
export type FormValues = z.infer<typeof formSchema>;

export const formSchema = z.object({
  name: z.string().min(3, { message: 'Required field' }),
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

// Initialization of Events
export const createTriggered = createEvent();
export const editTriggered = createEvent<{ id: string; values: FormValues }>();
export const formValidated = createEvent();
export const reset = createEvent();
export const uploaded = createEvent<RcFile>();
export const created = createEvent();
export const edited = createEvent();

// Initialization of Stores
// Stores whether user creating or editing
export const $mode = createStore<'create' | 'edit'>('create');

// Stores uploaded file
export const $file = createStore<RcFile | null>(null);

// Stores created tree id
export const $id = createStore<string | null>(null);

// Initialization of Closures
// Notifies about opening and closing of the form
export const disclosure = createDisclosure();

// Initialization of Forms
// Initial Form
export const form = createForm<FormValues>();

// Events without Clock
// Triggers when user creating or editing
$mode.on(createTriggered, () => 'create').on(editTriggered, () => 'edit');

// Attaching
// Uploads image to Cloudflare
const uploadImageFx = attach({
  source: $file,
  effect: (file) => {
    if (!file) {
      throw new Error('Local: no file');
    }

    const formData = new FormData();

    formData.append('file', file);

    return api.file.upload(FileUploadFolderEnum.TREE, formData);
  },
});

// Creates tree
const createTreeFx = attach({
  source: form.$formValues,
  effect: (body) => api.tree.create(body),
});

// Edits tree
const editTreeFx = attach({
  source: {
    values: form.$formValues,
    id: $id,
  },
  effect: ({ values, id }) => {
    console.log('wtf')
    if (!id) {
      throw new Error('Local: no id');
    }

    return api.tree.update(id, values);
  },
});

// Binding preview to form
const setPreviewToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, file: RcFile) => {
    const preview = URL.createObjectURL(file);

    return instance?.setValue('image', preview);
  },
});

// Binding path to form
const setPathToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, path: string) => {
    return instance?.setValue('image', path);
  },
});

// Mutation
// Pending effects holder
export const $mutating = or(
  uploadImageFx.pending,
  createTreeFx.pending,
  editTreeFx.pending
);

// Resolved effects holder
export const mutated = merge([createTreeFx.done, editTreeFx.done]);

// Events of Samples
// If user starts creating or editing, open the form
sample({
  clock: [editTriggered, createTriggered],
  target: disclosure.opened,
});

// If user starts editing, put values to form
sample({
  clock: editTriggered,
  target: spread({
    values: form.resetFx,
    id: $id,
  }),
});

// If form is validated, send it to next clock by mode
split({
  source: formValidated,
  match: $mode,
  cases: {
    create: created,
    edit: edited,
  },
});

// If image is uploaded, send it to uploadImageFx
sample({
  clock: created,
  source: form.$formValues,
  filter: (values) => !!values.image,
  target: uploadImageFx,
});

// If no image is uploaded, send it to createTreeFx
sample({
  clock: created,
  source: form.$formValues,
  filter: (values) => !values.image,
  target: createTreeFx,
});

// If blob image is exist then go with upload
sample({
  clock: edited,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('blob'),
  target: uploadImageFx,
});

// If image was uploaded before and not changed, send it to editTreeFx
sample({
  clock: edited,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('https'),
  target: editTreeFx,
});

// If there's no image at all, send it to editTreeFx
sample({
  clock: edited,
  source: form.$formValues,
  filter: (values) => !values.image,
  target: editTreeFx,
});

// Events of Image Samples
// If image is uploaded, send it to setPreviewToFormFx
sample({
  clock: uploadImageFx.doneData,
  fn: (response) => response.data.path,
  target: setPathToFormFx,
});

// If UI triggers uploaded, send it to setPreviewToFormFx
sample({
  clock: uploaded,
  target: [setPreviewToFormFx, $file],
});

// If setPreviewToFormFx is done, send it to createTreeFx/editTreeFx by mode
split({
  source: delay(setPathToFormFx.done, 0), // FIXME: need to remove delay without breaking anything
  match: $mode,
  cases: {
    create: createTreeFx,
    edit: editTreeFx,
  },
});

// Events of Closing and Cleaning of Form
// If user creates/edits form, close the form and reinit mode
sample({
  clock: [reset, mutated],
  target: [disclosure.closed, $mode.reinit],
});

// If user closes form, reset form
sample({
  clock: disclosure.closed,
  target: [
    form.resetFx.prepend(() => DEFAULT_VALUES),
    $file.reinit,
    $id.reinit,
  ],
});
