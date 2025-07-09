import { createEvent, createStore, sample, createEffect } from 'effector';
import { form } from '../../../features/tree/form';
import { FormValues } from '../../../features/tree/form/model';
import { RcFile } from 'antd/es/upload';
import { file } from '../../../../../../apps/web/src/shared/api/file';
import { tree } from '../../../../../../apps/web/src/shared/api/tree';
import { createDisclosure } from '../../../../../../apps/web/src/shared/lib/disclosure';

const disclosure = createDisclosure();
const formValidated = createEvent();
const mutated = createEvent();

const $imgPreview = createStore<string>('');
const resetImage = createEvent();
const setImagePreview = createEvent<string>();

$imgPreview.on(setImagePreview, (_, url) => url);
$imgPreview.on(resetImage, () => '');

const uploadImageFx = createEffect(async (fileInput: RcFile) => {
  const formData = new FormData();

  formData.append('file', fileInput);

  const res = await file.upload('tree', formData);

  return res.data.path;
});

const createTreeFx = createEffect(async (body: FormValues) => {
  return tree.create(body);
});

const $treeCreating = createTreeFx.pending;

// Chain effects and form submission
sample({
  clock: formValidated,
  source: form.$formValues,
  target: createTreeFx,
});

sample({
  clock: uploadImageFx.doneData,
  source: form.$formInstance,
  filter: (formInstance): formInstance is NonNullable<typeof formInstance> =>
    formInstance !== null,
  fn: (_formInstance, path) => ({
    name: 'image' as const,
    value: path,
  }),
  target: form.setValueFx,
});

// Reset form after success
sample({
  clock: createTreeFx.doneData,
  source: form.$formInstance,
  filter: (formInstance): formInstance is NonNullable<typeof formInstance> =>
    formInstance !== null,
  fn: () => ({
    name: '',
    image: '',
    public: false,
  }),
  target: form.resetFx,
});

export default {
  disclosure,
  formValidated,
  mutated,
  $imgPreview,
  resetImage,
  setImagePreview,
  uploadImageFx,
  createTreeFx,
  $treeCreating,
};
