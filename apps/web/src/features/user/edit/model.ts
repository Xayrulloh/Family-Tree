import {
  attach,
  createEvent,
  createStore,
  sample,
} from 'effector';
import { createDisclosure } from '~/shared/lib/disclosure';
import { createForm } from '~/shared/lib/create-form';
import { z } from 'zod';
import { api } from '~/shared/api';
import { RcFile } from 'antd/es/upload';
import { delay, or } from 'patronum';
import { FileUploadFolderEnum, UserGenderEnum } from '@family-tree/shared';
import { sessionFx } from '~/entities/user/model';

// Base
export type FormValues = z.infer<typeof formSchema>;

export const formSchema = z.object({
  name: z.string().min(3, { message: 'Required field' }),
  image: z.string().min(10, { message: 'Required field' }),
  gender: z.enum(['MALE' as UserGenderEnum.MALE, 'FEMALE' as UserGenderEnum.FEMALE, 'UNKNOWN' as UserGenderEnum.UNKNOWN]),
  birthdate: z.string().date().nullable(),
});

// Initialization of Events
export const editTriggered = createEvent<FormValues>();
export const formValidated = createEvent();
export const reset = createEvent();
export const uploaded = createEvent<RcFile>();

// Initialization of Stores
// Stores uploaded file
export const $file = createStore<RcFile | null>(null);

// Initialization of Closures
// Notifies about opening and closing of the form
export const disclosure = createDisclosure();

// Initialization of Forms
// Initial Form
export const form = createForm<FormValues>();

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

    return api.file.upload('avatar' as FileUploadFolderEnum.AVATAR, formData);
  },
});

// Edit Profile
const editProfileFx = attach({
  source: form.$formValues,
  effect: (values) => {
    if (!values.name) {
      throw new Error('Local: no user name');
    }

    return api.user.update(values);
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
  editProfileFx.pending,
);

// Resolved effects holder
export const mutated = editProfileFx.done

// Events of Samples
sample({
  clock: editTriggered,
  target: [disclosure.opened, form.resetFx],
});

// If user starts editing, open the form
sample({
  clock: editTriggered,
  target: disclosure.opened,
});

// If user starts editing, put values to form
sample({
  clock: editTriggered,
  source: editTriggered.map((values) => values),
  target: form.resetFx,
});

// If image is uploaded, send it to uploadImageFx
sample({
  clock: formValidated,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('blob'),
  target: uploadImageFx,
});

// Events of Image Samples
// If image was uploaded before and not changed, send it to editProfileFx
sample({
  clock: formValidated,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('https'),
  target: editProfileFx,
});

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

// If setPreviewToFormFx is done, send it to createTreeFx/editProfileFx by mode
sample({
  clock: delay(setPathToFormFx.done, 0), // FIXME: need to remove delay without breaking anything
  target: editProfileFx,
})

// If editProfileFx is done, reset user info by calling sessionFx
sample({
  clock: editProfileFx.done,
  target: sessionFx,
});

// Events of Closing and Cleaning of Form
// If user creates/edits form, close the form and reinit mode
sample({
  clock: [reset, mutated],
  target: [disclosure.closed],
});

// If user closes form, reset form
sample({
  clock: disclosure.closed,
  target: [
    $file.reinit,
  ],
});
