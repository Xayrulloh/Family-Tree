import {
  type FamilyTreeMemberGetResponseType,
  UserGenderEnum,
} from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';

// Events
export const addBoyTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const addGirlTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const created = createEvent();

// Stores
export const $mother = createStore<FamilyTreeMemberGetResponseType | null>(
  null,
);

// Effects
const addBoyFx = attach({
  source: $mother,
  effect: (value) => {
    if (!value) throw new Error('Mother is not initialized');

    return api.treeMember.createChild(
      { familyTreeId: value.familyTreeId },
      {
        gender: UserGenderEnum.MALE,
        fromMemberId: value.id,
      },
    );
  },
});

const addGirlFx = attach({
  source: $mother,
  effect: (value) => {
    if (!value) throw new Error('Mother is not initialized');

    return api.treeMember.createChild(
      { familyTreeId: value.familyTreeId },
      {
        gender: UserGenderEnum.FEMALE,
        fromMemberId: value.id,
      },
    );
  },
});

// Samples
// Create Member
sample({
  clock: addBoyTrigger,
  target: [$mother, addBoyFx],
});

sample({
  clock: addGirlTrigger,
  target: [$mother, addGirlFx],
});

// Ending part
sample({
  clock: [addBoyFx.done, addGirlFx.done],
  target: [created, $mother.reinit],
});
