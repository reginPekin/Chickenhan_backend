import { dbAdd, dbGet } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

import { getUserById, User } from './user';

export type RegMethod = 'google' | 'facebook' | 'mail';

export interface AuthGoogle {
  userId: string;
  googleToken: string;
}

export interface AuthFacebook {
  userId: string;
  facebookToken: string;
}

export interface AuthMail {
  userId: string;
  password: string;
  login: string;
}

async function getGoogleUserId(googleToken: string): Promise<string> {
  const authInfo = await dbGet<AuthGoogle>('authGoogle', { googleToken });
  const userId = authInfo?.userId;

  if (!userId) {
    throw new ErrorNotFound('userId error not found');
  }

  return userId;
}

export async function getUserByGoogleToken(googleToken: string): Promise<User> {
  const userId = await getGoogleUserId(googleToken);
  const user = await getUserById(userId);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}

async function getFacebookUserId(facebookToken: string): Promise<string> {
  const authInfo = await dbGet<AuthFacebook>('authFacebook', { facebookToken });
  const userId = authInfo?.userId;

  if (!userId) {
    throw new ErrorNotFound('userId error not found');
  }
  return userId;
}

export async function getUserByFacebookToken(
  facebookToken: string,
): Promise<User> {
  const userId = await getFacebookUserId(facebookToken);
  const user = await getUserById(userId);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}

async function getMailUserId(password: string, login: string): Promise<string> {
  const authInfo = await dbGet<AuthMail>('authMail', { login, password });
  const userId = authInfo?.userId;

  if (!userId) {
    throw new ErrorNotFound('userId error not found');
  }
  return userId;
}

export async function getUserByMailParams(
  password: string,
  login: string,
): Promise<User> {
  const userId = await getMailUserId(password, login);
  const user = await getUserById(userId);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}
