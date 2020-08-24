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

export async function getUserByToken(token: string): Promise<User> {
  const user = await dbGet<User>('users', { token });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }
  return user;
}

export function addUserByLogin(login: string): Promise<User> {
  const token = crypto.randomBytes(64).toString('hex');

  const newUser = {
    token,
    login,
    avatar: '',
    online: false,
  };

  return dbAdd('users', newUser);
}

export function updateUser(id: string, queries: Partial<User>) {
  return dbUpdate('users', queries, { id });
}
