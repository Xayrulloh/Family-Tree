import { userModel } from '~/entities/user';
import type { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  const _authorizedRoute = userModel.chainAuthorized({ route });

  return {};
};
