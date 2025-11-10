import { FileUploadFolderEnum, UserGenderEnum } from '@family-tree/shared';
import type { RcFile } from 'antd/es/upload';
import {
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
} from 'effector';
import { isEqual } from 'lodash';
import { delay, or } from 'patronum';
import { z } from 'zod';
import { userModel } from '~/entities/user';
import { api } from '~/shared/api';
import { createForm } from '~/shared/lib/create-form';
import { createDisclosure } from '~/shared/lib/disclosure';
import { infoFx } from '~/shared/lib/message';

// Schema and Types
export type FormValues = z.infer<typeof formSchema>;

export const formSchema = z.object({
  name: z.string().min(3, { message: 'Required field' }),
  image: z.string().min(10, { message: 'Required field' }),
  gender: z.enum([
    UserGenderEnum.MALE,
    UserGenderEnum.FEMALE,
    UserGenderEnum.UNKNOWN,
  ]),
  dob: z.string().date().nullable(),
});

// Events
export const editTriggered = createEvent<FormValues>();
export const randomAvatarTriggered = createEvent();
export const formValidated = createEvent();
export const reset = createEvent();
export const uploaded = createEvent<RcFile>();

// Stores
export const $file = createStore<RcFile | null>(null);

// Disclosures
export const disclosure = createDisclosure();

//Form
export const form = createForm<FormValues>();

// Effects
// Uploads an image file to the server
const uploadImageFx = attach({
  source: $file,
  effect: (file) => {
    if (!file) throw new Error('Local: no file');

    const formData = new FormData();

    formData.append('file', file);

    return api.file.upload(FileUploadFolderEnum.AVATAR, formData);
  },
});

// Sends form values to edit user profile
const editProfileFx = attach({
  source: form.$formValues,
  effect: (values) => api.user.update(values),
});

// Generates preview URL and assigns it to form image field
const setPreviewToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, file: RcFile) => {
    const preview = URL.createObjectURL(file);

    return instance?.setValue('image', preview);
  },
});

// Assigns uploaded image path to the form image field
const setPathToFormFx = attach({
  source: form.$formInstance,
  effect: (instance, path: string) => {
    return instance?.setValue('image', path);
  },
});

// Sends request to random avatar endpoint
const randomAvatarFx = createEffect(() => api.user.randomAvatar());

// Derived State
export const $mutating = or(uploadImageFx.pending, editProfileFx.pending);
export const mutated = editProfileFx.done;

// Samples
// Open modal and reset form with values on edit trigger
sample({
  clock: editTriggered,
  target: [disclosure.opened, form.resetFx],
});

// Send uploaded file to preview and store
sample({
  clock: uploaded,
  target: [setPreviewToFormFx, $file],
});

// If image is a blob (not uploaded yet), trigger upload
sample({
  clock: formValidated,
  source: form.$formValues,
  filter: (values) => !!values.image && values.image.startsWith('blob'),
  target: uploadImageFx,
});

// If image is already a URL, skip upload and go directly to edit
sample({
  clock: formValidated,
  source: {
    original: userModel.$user,
    edited: form.$formValues,
  },
  filter: ({ original, edited }) => {
    if (
      !!edited.image &&
      edited.image.startsWith('https') &&
      isEqual(
        {
          dob: original?.dob,
          gender: original?.gender,
          name: original?.name,
          image: original?.image,
        },
        edited,
      )
    ) {
      infoFx('No changes detected');

      return false;
    }

    return true;
  },
  target: editProfileFx,
});

// After image upload completes, put image path into form
sample({
  clock: uploadImageFx.doneData,
  fn: (response) => response.data.path,
  target: setPathToFormFx,
});

// When form gets image path, proceed to profile edit
sample({
  clock: delay(setPathToFormFx.done, 0), // FIXME: delay workaround, remove if no race conditions
  target: editProfileFx,
});

// After successful profile edit, refresh session user
sample({
  clock: editProfileFx.done,
  target: userModel.sessionFx,
});

// Close modal on reset or successful edit
sample({
  clock: [reset, mutated],
  target: [disclosure.closed],
});

// On modal close, clear temporary state
sample({
  clock: disclosure.closed,
  target: [$file.reinit],
});

// If user clicks random avatar, trigger random avatar request
sample({
  clock: randomAvatarTriggered,
  target: randomAvatarFx,
});

// After random avatar request completes, call sessionFx
sample({
  clock: randomAvatarFx.doneData,
  target: userModel.sessionFx,
});
