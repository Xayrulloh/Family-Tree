import { createEffect, createStore } from 'effector';
import { FamilyTreeSchemaType } from '@family-tree/shared';
import { api } from '../../shared/api';

export const fetchTreesFx = createEffect(async () => {
  const res = await api.tree.findAll();

  return res.data;
});

export const $trees = createStore<FamilyTreeSchemaType[]>([]);

$trees.on(fetchTreesFx.doneData, (_, trees) => trees);

export default {
  fetchTreesFx,
  $trees,
};
