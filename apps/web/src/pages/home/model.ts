import { userModel } from '~/entities/user';
import { LazyPageFactoryParams } from '~/shared/lib/lazy-page';

export const factory = ({ route }: LazyPageFactoryParams) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const authorizedRoute = userModel.chainAuthorized({ route });

  return {};
};
