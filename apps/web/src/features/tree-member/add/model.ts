import {
  type FamilyTreeMemberGetResponseType,
  UserGenderEnum,
} from '@family-tree/shared';
import { attach, createEvent, createStore, sample } from 'effector';
import { api } from '~/shared/api';
import { $treeScope } from '~/shared/config/tree-scope';

// Events
export const addBoyTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const addGirlTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Mother
export const addSpouseTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Husband or Wife
export const addParentsTrigger = createEvent<FamilyTreeMemberGetResponseType>(); // Husband or Wife
export const created = createEvent();
export const lastAddedMemberIdTrigger = createEvent();

// Stores
export const $member = createStore<FamilyTreeMemberGetResponseType | null>(
  null,
);
export const $lastAddedMemberId = createStore<string | null>(null);

// Effects
const addBoyFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Member is not initialized');

    return api.treeMember.createChild(
      { familyTreeId: member.familyTreeId, scope },
      {
        gender: UserGenderEnum.MALE,
        fromMemberId: member.id,
      },
    );
  },
});

const addGirlFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Member is not initialized');

    return api.treeMember.createChild(
      { familyTreeId: member.familyTreeId, scope },
      {
        gender: UserGenderEnum.FEMALE,
        fromMemberId: member.id,
      },
    );
  },
});

const addSpouseFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Member is not initialized');

    return api.treeMember.createSpouse(
      { familyTreeId: member.familyTreeId, scope },
      {
        fromMemberId: member.id,
      },
    );
  },
});

const addParentsFx = attach({
  source: { member: $member, scope: $treeScope },
  effect: ({ member, scope }) => {
    if (!member) throw new Error('Member is not initialized');

    return api.treeMember.createParents(
      { familyTreeId: member.familyTreeId, scope },
      {
        fromMemberId: member.id,
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

// Capture last added member id for post-add focus (parents excluded)
sample({
  clock: [addBoyFx.doneData, addGirlFx.doneData, addSpouseFx.doneData],
  fn: (response) => response.data.id,
  target: $lastAddedMemberId,
});

// Reset last added member id after it's consumed
sample({
  clock: lastAddedMemberIdTrigger,
  target: $lastAddedMemberId.reinit,
});

// Ending part
sample({
  clock: [addBoyFx.done, addGirlFx.done, addSpouseFx.done, addParentsFx.done],
  target: [created, $member.reinit],
});
