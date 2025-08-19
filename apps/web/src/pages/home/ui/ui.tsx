import { Link } from 'atomic-router-react';
import { routes } from '~/shared/config/routing';
import { factory } from '../model';

const HomePage: React.FC = () => {
  return (
    <main className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 sm:px-6 md:px-8">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          Welcome to Family Tree
        </h1>
        <Link
          to={routes.trees}
          className="text-lg text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
        >
          View Family Trees
        </Link>
      </section>
    </main>
  );
};

export const component = HomePage;
export const createModel = factory;
