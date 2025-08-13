import { Auth } from '~/features/auth';
import { factory } from '../model';

const RegistrationPage = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8"
    >
      <Auth />
    </div>
  );
};

export const component = RegistrationPage;
export const createModel = factory;
