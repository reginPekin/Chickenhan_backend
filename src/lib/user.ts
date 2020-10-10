import * as crypto from 'crypto';

import { dbGet, dbAdd, dbUpdate } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface User {
  readonly id: number;
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
  readonly id: number;

  login: string;
  is_online: boolean;
  avatar: string;
}

export async function getUserById(id: number): Promise<User> {
  const user = await dbGet<User>('users', { id });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  // send default avatar url
  if (!user?.avatar) {
    user.avatar = 'https://i.ytimg.com/vi/fpRJNptYa_o/maxresdefault.jpg';
  }

  return user;
}

export async function getUserWrapperById(id: number): Promise<UserWrap> {
  const user = await dbGet<User>('users', { id });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  // send default avatar url
  if (!user?.avatar) {
    user.avatar = 'https://i.ytimg.com/vi/fpRJNptYa_o/maxresdefault.jpg';
  }

  const { token, online, ...wrappedUser } = user;

  return { ...wrappedUser, is_online: online };
}

export async function getUserByToken(token: string): Promise<User> {
  // keshirovat'
  const user = await dbGet<User>('users', { token });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  // send default avatar
  if (!user?.avatar) {
    user.avatar = 'https://i.ytimg.com/vi/fpRJNptYa_o/maxresdefault.jpg';
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

export async function updateUser(
  id: number,
  queries: Partial<User>,
): Promise<UserWrap> {
  const user = await dbUpdate<User>('users', queries, { id });
  if (!user?.avatar) {
    user.avatar = 'https://i.ytimg.com/vi/fpRJNptYa_o/maxresdefault.jpg';
  }

  const { token, online, ...wrappedUser } = user;

  return { ...wrappedUser, is_online: online };
}

export function updateUserByToken(
  token: string,
  queries: Partial<User>,
): Promise<User> {
  return dbUpdate('users', queries, { token });
}
