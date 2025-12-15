import { Auth } from '~/features/auth';
import { factory } from '../model';

const RegistrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Auth />
    </div>
  );
};

export const component = RegistrationPage;
export const createModel = factory;
