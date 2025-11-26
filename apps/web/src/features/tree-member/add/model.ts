import {
  type FamilyTreeMemberGetResponseType,
  UserGenderEnum,
} from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';

// Events
export const addBoyTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const addGirlTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const addSpouseTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Husband or Wife
export const addParentsTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Husband or Wife
export const created = createEvent();

// Stores
export const $member = createStore<FamilyTreeMemberGetResponseType | null>(
  null,
);

// Effects
const addBoyFx = attach({
  source: $member,
  effect: (value) => {
    if (!value) throw new Error('Member is not initialized');

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
  source: $member,
  effect: (value) => {
    if (!value) throw new Error('Member is not initialized');

    return api.treeMember.createChild(
      { familyTreeId: value.familyTreeId },
      {
        gender: UserGenderEnum.FEMALE,
        fromMemberId: value.id,
      },
    );
  },
});

const addSpouseFx = attach({
  source: $member,
  effect: (value) => {
    if (!value) throw new Error('Member is not initialized');

    return api.treeMember.createSpouse(
      { familyTreeId: value.familyTreeId },
      {
        fromMemberId: value.id,
      },
    );
  },
});

const addParentsFx = attach({
  source: $member,
  effect: (value) => {
    if (!value) throw new Error('Member is not initialized');

    return api.treeMember.createParents(
      { familyTreeId: value.familyTreeId },
      {
        fromMemberId: value.id,
      },
    );
  },
});

// Samples
// Create Member
sample({
  clock: addBoyTrigger,
  target: [$member, addBoyFx],
});

sample({
  clock: addGirlTrigger,
  target: [$member, addGirlFx],
});

sample({
  clock: addSpouseTrigger,
  target: [$member, addSpouseFx],
});

sample({
  clock: addParentsTrigger,
  target: [$member, addParentsFx],
});

// Ending part
sample({
  clock: [addBoyFx.done, addGirlFx.done, addSpouseFx.done, addParentsFx.done],
  target: [created, $member.reinit],
});
