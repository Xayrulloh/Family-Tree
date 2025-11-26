import {
  ArrowRightOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  GoogleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Card } from 'antd';
import { routes } from '~/shared/config/routing';
import { factory } from '../model';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: "url('/hero-family-tree.png')",
            backgroundPosition: 'center center',
          }}
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Trusted by 10,000+ families worldwide
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight animate-fade-in-up">
              Your Family's
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                Legacy Begins Here
              </span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto font-light animate-fade-in-up animation-delay-200">
              Create stunning family trees, preserve cherished memories, and
              discover your roots with our beautiful, intuitive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="!text-lg !px-10 !py-7 !h-auto !rounded-full !bg-gradient-to-r !from-blue-600 !to-indigo-600 !border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                onClick={() => routes.registration.open()}
              >
                <span className="font-semibold">Start Your Journey</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-fade-in-up animation-delay-600">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500 text-lg" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500 text-lg" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500 text-lg" />
                <span>Privacy protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed to make preserving your family's story
              effortless and beautiful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: <PlusCircleOutlined className="text-4xl" />,
                color: 'from-blue-400 to-blue-600',
                bgColor: 'from-blue-50 to-blue-100',
                title: 'Easy to Build',
                description:
                  'Create family members with just a few clicks. Add unlimited members in seconds, not minutes.',
              },
              {
                icon: <BranchesOutlined className="text-4xl" />,
                color: 'from-purple-400 to-purple-600',
                bgColor: 'from-purple-50 to-purple-100',
                title: 'Beautiful Visualization',
                description:
                  'See your family connections come to life with stunning, interactive tree views and layouts.',
              },
              {
                icon: <FileImageOutlined className="text-4xl" />,
                color: 'from-rose-400 to-rose-600',
                bgColor: 'from-rose-50 to-rose-100',
                title: 'Preserve Memories',
                description:
                  'Store unlimited photos, stories, and important dates to keep your heritage alive forever.',
              },
              {
                icon: <SearchOutlined className="text-4xl" />,
                color: 'from-emerald-400 to-emerald-600',
                bgColor: 'from-emerald-50 to-emerald-100',
                title: 'Discover Connections',
                description:
                  'Explore relationships and uncover fascinating stories about your ancestors with smart insights.',
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-8">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building your family tree has never been this easy
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div
                className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300"
                style={{ top: '4rem' }}
              />

              {[
                {
                  number: '1',
                  icon: <GoogleOutlined className="text-3xl" />,
                  title: 'Sign In with Google',
                  description:
                    'Quick and secure login with your Google account. No manual registration or passwords needed.',
                  color: 'from-blue-500 to-blue-700',
                },
                {
                  number: '2',
                  icon: <BranchesOutlined className="text-3xl" />,
                  title: 'Create Your Tree',
                  description:
                    'Start building your family tree instantly. Add 1000+ members in a single tree with no limitations.',
                  color: 'from-purple-500 to-purple-700',
                },
                {
                  number: '3',
                  icon: <FileImageOutlined className="text-3xl" />,
                  title: 'Add Details',
                  description:
                    'Enrich your tree with photos, stories, dates, and special memories that bring your family history to life.',
                  color: 'from-emerald-500 to-emerald-700',
                },
              ].map((step) => (
                <div key={step.number} className="relative text-center group">
                  <div
                    className={`w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-4xl font-bold shadow-2xl relative z-10 transform group-hover:scale-110 transition-all duration-500`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight">
              Ready to Preserve Your
              <span className="block mt-2">Family's Legacy?</span>
            </h2>

            <p className="text-xl sm:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join thousands of families who are already creating beautiful
              family trees and preserving memories.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="!text-lg !px-12 !py-8 !h-auto !rounded-full !bg-white !text-blue-600 !border-0 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-bold"
                onClick={() => routes.registration.open()}
              >
                Start Your Free Tree
              </Button>

              <p className="text-sm opacity-75">
                No credit card required • Free forever
              </p>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { number: '10,000+', label: 'Active Families' },
                { number: '50,000+', label: 'Trees Created' },
                { number: '1M+', label: 'Memories Preserved' },
              ].map((stat) => (
                <div key={stat.number} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg opacity-75">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Family Tree
            </h3>
            <p className="text-sm opacity-75">
              © 2024 Family Tree. Preserving memories for generations.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scroll {
          0%, 20% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export const component = HomePage;
export const createModel = factory;
