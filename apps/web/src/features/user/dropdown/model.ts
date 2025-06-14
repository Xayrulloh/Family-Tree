import { createEffect, createEvent, createStore, sample } from 'effector';
import { $user } from '../../../entities/user/model';
import { UserSchemaType } from '@family-tree/shared';
import { api } from '../../../shared/api';

// Events
export const profileOpened = createEvent();
export const profileEditStarted = createEvent();
export const profileEditCancelled = createEvent();
export const profileUpdated = createEvent<Partial<UserSchemaType>>();

// Stores
export const $profile = $user

export const $isEditing = createStore(false)
  .on(profileEditStarted, () => true)
  .on([profileEditCancelled, profileUpdated], () => false);

// Mock API effect
const updateProfileFx = createEffect(async (profile: Partial<UserSchemaType>) => {
  await api.user.update(profile);

  console.log('Updating profile with:', profile);

  return profile;
});

// Connect profile update event to the effect
sample({
  clock: profileUpdated,
  target: updateProfileFx,
});

// Update local profile state when API call succeeds
sample({
  clock: updateProfileFx.doneData,
  source: $profile,
  fn: (currentProfile, updatedFields) => {
    if (!currentProfile) return null;

    return {
      ...currentProfile,
      ...updatedFields,
    };
  },
  target: $profile,
});