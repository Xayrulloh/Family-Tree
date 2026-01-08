import * as Sentry from '@sentry/react';

Sentry.init({
  dsn:
    import.meta.env.VITE_SENTRY_DSN ||
    'https://50e07e5922597894c81f2f690323820b@o4510431727845376.ingest.de.sentry.io/4510431737348176',

  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
