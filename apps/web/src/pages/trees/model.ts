import { FamilyTreeSchemaType } from '@family-tree/shared';
import { createEffect, createStore, sample } from 'effector';
import { userModel } from '~/entities/user';
import { createEditTreeModel } from '~/features/tree/create-edit';
import { deleteTreeModel } from '~/features/tree/delete';
import { api } from '~/shared/api';
import { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  const $trees = createStore<FamilyTreeSchemaType[]>([]);

  const fetchTreesFx = createEffect(async () => api.tree.findAll());

  sample({
    clock: [
      authorizedRoute.opened,
      createEditTreeModel.mutated,
      deleteTreeModel.mutated,
    ],
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
