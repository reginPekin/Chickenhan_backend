import * as crypto from 'crypto';

import { dbGet, dbAdd, dbUpdate } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface User {
  readonly id: string;
  readonly token: string;

  login: string;
  online: boolean;
  avatar: string;
}

export interface UserManual {
  readonly token: string;

  login: string;
  online: boolean;
  avatar: string;
}

export interface UserWrap {
  readonly id: string;

  login: string;
  online: boolean;
  avatar: string;
}

export async function getUserById(id: string): Promise<User> {
  const user = await dbGet<User>('users', { id });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }
  return user;
}

export function addUser(login: string): Promise<User> {
  const token = crypto.randomBytes(64).toString('hex');

  const avatar =
    'https://avatars.mds.yandex.net/get-pdb/1778306/63bc56a1-0a99-4322-bc1f-08a6f3cf2bb3/s375';

  const newUser = {
    token,
    login,
    avatar,
    online: false,
  };

  return dbAdd('users', newUser);
}

export function updateUser(id: string, queries: Partial<User>) {
  return dbUpdate('users', { id }, queries);
}
