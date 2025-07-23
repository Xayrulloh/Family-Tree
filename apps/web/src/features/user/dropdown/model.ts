import { createEvent } from 'effector';
import { $user } from '~/entities/user/model';

// Event to open profile (if needed for future analytics)
export const profileOpened = createEvent();

// Just export the existing user store with a new name
export const $profile = $user;
