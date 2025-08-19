import { createEffect } from 'effector';

// Simulate Google login
const googleLoginFx = createEffect(async () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;

  return window.location.href;
});

export { googleLoginFx };
