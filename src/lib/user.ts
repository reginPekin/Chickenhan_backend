import { dbGet, dbAdd, dbUpdate } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface User {
  name: string;
  age: number;
}

export async function getUserByName(name: string): Promise<User> {
  const user = await dbGet<User>('users', { name });

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }
  return user;
  // server.respond(user);
}

export function addUser(data: any) {
  return dbAdd('users', data);
}

export function updateUserByAge({ name, age }: User) {
  return dbUpdate('users', { name }, { age });
}
