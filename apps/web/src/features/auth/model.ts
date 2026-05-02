import { createEffect } from 'effector';

// Simulate Google login
const googleLoginFx = createEffect(() => {
  window.location.assign(`${import.meta.env.VITE_API_URL}/auth/google`);
});

export { googleLoginFx };
