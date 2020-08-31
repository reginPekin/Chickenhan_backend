import { dbAdd, dbGet } from '../utils/db';
import { ErrorNotFound, ChickenhanError } from '../utils/error';

import { getUserById, User, addUserByLogin } from './user';

export type RegMethod = 'google' | 'facebook' | 'login';

export interface AuthGoogle {
  readonly user_id: number;
  readonly google_token: string;
}

export interface AuthFacebook {
  readonly user_id: number;
  readonly facebook_token: string;
}

export interface AuthLogin {
  readonly user_id: number;
  password: string;
  login: string;
}

async function getGoogleUserId(google_token: string): Promise<number> {
  const authInfo = await dbGet<AuthGoogle>('auth_google', { google_token });
  const user_id = authInfo?.user_id;

  if (!user_id) {
    throw new ErrorNotFound('user_id error not found');
  }

  return user_id;
}

export async function getUserByGoogleToken(
  google_token: string,
): Promise<User> {
  const user_id = await getGoogleUserId(google_token);
  const user = await getUserById(user_id);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}

async function getFacebookUserId(facebook_token: string): Promise<number> {
  const authInfo = await dbGet<AuthFacebook>('auth_facebook', {
    facebook_token,
  });
  const user_id = authInfo?.user_id;

  if (!user_id) {
    throw new ErrorNotFound('user_id error not found');
  }
  return user_id;
}

export async function getUserByFacebookToken(
  facebook_token: string,
): Promise<User> {
  const user_id = await getFacebookUserId(facebook_token);
  const user = await getUserById(user_id);

  if (!user) {
    throw new ErrorNotFound('user error not found');
  }

  return user;
}

async function getMailUserId(login: string): Promise<AuthLogin> {
  const authInfo = await dbGet<AuthLogin>('auth_login', { login });

  if (!authInfo) {
    throw new ErrorNotFound('auth error not found');
  }

  return authInfo;
}

export async function getUserByLoginParams(
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

export async function signUpUserByLogin(password: string, login: string) {
  const existingUser = await dbGet<AuthLogin>('auth_login', { login });

  if (existingUser?.user_id) {
    throw new ChickenhanError(
      409,
      'Already exists',
      'This login already exists',
    );
  }

  const newUser = await addUserByLogin(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  dbAdd('auth_login', { password, login, user_id: newUser.id });

  return newUser;
}

export async function signUpUserByFacebook(
  facebook_token: string,
  login: string,
) {
  const newUser = await addUserByLogin(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  const user_id = newUser.id;
  dbAdd('auth_facebook', { facebook_token, user_id });

  return newUser;
}

export async function signUpUserByGoogle(google_token: string, login: string) {
  const newUser = await addUserByLogin(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  const user_id = newUser.id;
  dbAdd('auth_google', { google_token, user_id });

  return newUser;
}
