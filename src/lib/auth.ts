import { dbAdd, dbGet } from '../utils/db';
import { ErrorNotFound, ChickenhanError } from '../utils/error';

import { getUserById, User, addUser } from './user';

export type RegMethod = 'google' | 'facebook' | 'mail';

export interface AuthGoogle {
  user_id: string;
  googleToken: string;
}

export interface AuthFacebook {
  user_id: string;
  facebookToken: string;
}

export interface AuthMail {
  user_id: string;
  password: string;
  login: string;
}

async function getGoogleUserId(googleToken: string): Promise<string> {
  const authInfo = await dbGet<AuthGoogle>('authGoogle', { googleToken });
  const user_id = authInfo?.user_id;

  if (!user_id) {
    throw new ErrorNotFound('user_id error not found');
  }

  return user_id;
}

export async function getUserByGoogleToken(googleToken: string): Promise<User> {
  const user_id = await getGoogleUserId(googleToken);
  const user = await getUserById(user_id);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}

async function getFacebookUserId(facebookToken: string): Promise<string> {
  const authInfo = await dbGet<AuthFacebook>('authFacebook', { facebookToken });
  const user_id = authInfo?.user_id;

  if (!user_id) {
    throw new ErrorNotFound('user_id error not found');
  }
  return user_id;
}

export async function getUserByFacebookToken(
  facebookToken: string,
): Promise<User> {
  const user_id = await getFacebookUserId(facebookToken);
  const user = await getUserById(user_id);

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

  if (dbPassword && password !== dbPassword) {
    throw new ChickenhanError(
      401,
      'Wrong password',
      'Wrong password, but login exists',
    );
  }

  // authInfo  { userid: 2, password: 'zeleniybober', login: 'bober' }
  const user_id = authInfo?.user_id;

  if (!user_id) {
    throw new ErrorNotFound('user_id error not found');
  }

  const user = await getUserById(user_id);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }
  return user;
}

export async function signUpUserByMail(password: string, login: string) {
  const newUser = await addUser(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  dbAdd('authMail', { password, login, user_id: newUser.id });

  return newUser;
}
