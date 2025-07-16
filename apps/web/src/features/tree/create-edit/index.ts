import {
  editTriggered,
  createTriggered,
  reset,
  mutated,
  deleteTriggered,
} from './model';

export { CreateEditTreeModal } from './ui';
export const createEditTreeModel = {
  editTriggered,
  createTriggered,
  deleteTriggered,
  reset,
  mutated,
};
