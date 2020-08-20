import { dbGet, dbAdd, dbUpdate } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface User {
  readonly id: string;
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

export function addUser(data: User) {
  return dbAdd('users', data);
}

export function updateUser(id: string, queries: Partial<User>) {
  return dbUpdate('users', { id }, queries);
}
