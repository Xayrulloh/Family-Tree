import { sample } from 'effector';
import { LazyPageFactoryParams } from '../../shared/lib/lazy-page';
import { userModel } from '../../entities/user';
import { treeModel } from '../../entities/trees';
import { treeCreateModel } from '../../features/tree/create';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const authorizedRoute = userModel.chainAuthorized({ route });

  const $treesFetching = treeModel.fetchTreesFx.pending;

  sample({
    clock: authorizedRoute.opened,
    target: treeModel.fetchTreesFx,
  });

  sample({
    clock: treeCreateModel.mutated,
    target: treeModel.fetchTreesFx,
  });

  return {
    $trees: treeModel.$trees,
    $treesFetching,
  };
};
