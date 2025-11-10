import { auth } from './auth';
import { fcmToken } from './fcm-token';
import { file } from './file';
import { notification } from './notification';
import { tree } from './tree';
import { treeMember } from './tree-member';
import { treeMemberConnection } from './tree-member-connection';
import { user } from './user';

export const api = {
  auth,
  user,
  tree,
  file,
  fcmToken,
  notification,
  treeMember,
  treeMemberConnection,
};
