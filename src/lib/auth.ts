import { dbAdd, dbGet } from '../utils/db';
import { ErrorNotFound, ChickenhanError } from '../utils/error';

import { getUserById, User, addUserByLogin } from './user';

export type RegMethod = 'google' | 'facebook' | 'login';

export interface AuthGoogle {
  readonly user_id: number;
  readonly googleToken: string;
}

export interface AuthFacebook {
  readonly user_id: number;
  readonly facebookToken: string;
}

export interface AuthLogin {
  readonly user_id: number;
  password: string;
  login: string;
}

async function getGoogleUserId(googleToken: string): Promise<number> {
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

async function getFacebookUserId(facebookToken: string): Promise<number> {
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

async function getMailUserId(login: string): Promise<AuthLogin> {
  const authInfo = await dbGet<AuthLogin>('authLogin', { login });

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
  const existingUser = await dbGet<AuthLogin>('authLogin', { login });

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

  dbAdd('authLogin', { password, login, user_id: newUser.id });

  return newUser;
}

export async function signUpUserByFacebook(
  facebookToken: string,
  login: string,
) {
  const newUser = await addUserByLogin(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  const user_id = newUser.id;
  dbAdd('authFacebook', { facebookToken, user_id });

  return newUser;
}

export async function signUpUserByGoogle(googleToken: string, login: string) {
  const newUser = await addUserByLogin(login);

  if (!newUser.id) {
    throw new ErrorNotFound('user error not found');
  }

  const user_id = newUser.id;
  dbAdd('authGoogle', { googleToken, user_id });

  return newUser;
}
