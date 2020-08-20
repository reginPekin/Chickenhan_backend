import { dbAdd, dbGet } from '../utils/db';
import { ErrorNotFound, ChickenhanError } from '../utils/error';

import { getUserById, User, addUser } from './user';

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

async function getMailUserId(login: string): Promise<AuthMail> {
  const authInfo = await dbGet<AuthMail>('authMail', { login });

  if (!authInfo) {
    throw new ErrorNotFound('auth error not found');
  }

  return authInfo;
}

export async function getUserByMailParams(
  password: string,
  login: string,
): Promise<User> {
  const authInfo = await getMailUserId(login);
  const dbPassword = authInfo?.password;
  console.log(1);

  if (dbPassword && password !== dbPassword) {
    throw new ChickenhanError(
      401,
      'Wrong password',
      'Wrong password, but login exists',
    );
  }

  // authInfo  { userid: 2, password: 'zeleniybober', login: 'bober' }
  console.log(authInfo.userId, 'auth info');
  const userId = authInfo?.userId;

  if (!userId) {
    throw new ErrorNotFound('userId error not found');
  }
  console.log(3);
  const user = await getUserById(userId);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }
  console.log(4);
  return user;
}

export async function signUpUserByMail(password: string, login: string) {
  const newUser = await addUser(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  dbAdd('authMail', { password, login, userId: newUser.id });

  return newUser;
}
