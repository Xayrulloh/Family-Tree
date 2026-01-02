import { auth } from './auth';
import { fcmToken } from './fcm-token';
import { file } from './file';
import { notification } from './notification';
import { tree } from './tree';
import { treeMember } from './tree-member';
import { treeMemberConnection } from './tree-member-connection';
import { user } from './user';
import { sharedTree } from './shared-tree';

export const api = {
  auth,
  user,
  tree,
  sharedTree,
  file,
  fcmToken,
  notification,
  treeMember,
  treeMemberConnection,
};
