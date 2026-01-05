import { createEffect } from 'effector';

// Simulate Google login + redirect to return_url
const googleLoginFx = createEffect(async () => {
  const returnUrl = localStorage.getItem('auth_redirect_url');

  if (returnUrl) {
    localStorage.removeItem('auth_redirect_url');
  }

  const backendLoginUrl = new URL(
    `${import.meta.env.VITE_API_URL}/auth/google`,
  );

  if (returnUrl) {
    backendLoginUrl.searchParams.append('return_url', returnUrl);
  }

  window.location.href = backendLoginUrl.toString();

  return window.location.href;
});

export { googleLoginFx };
