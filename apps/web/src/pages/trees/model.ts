import { sample } from 'effector';
import { LazyPageFactoryParams } from '~/shared/lib/lazy-page';
import { userModel } from '~/entities/user';
import { createEditTreeModel } from '~/features/tree/create-edit';

import { createEffect, createStore } from 'effector';
import { FamilyTreeSchemaType } from '@family-tree/shared';
import { api } from '~/shared/api';
import { deleteTreeModel } from '~/features/tree/delete';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  const $trees = createStore<FamilyTreeSchemaType[]>([]);

  const fetchTreesFx = createEffect(async () => api.tree.findAll());

  sample({
    clock: [authorizedRoute.opened, createEditTreeModel.mutated, deleteTreeModel.mutated],
    target: fetchTreesFx,
  });

  sample({
    clock: fetchTreesFx.doneData,
    fn: (response) => response.data,
    target: $trees,
  });

  return {
    $trees,
    $fetching: fetchTreesFx.pending,
  };
};
