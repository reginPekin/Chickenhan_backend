import { Server } from '../utils/server';

import * as lib from '../lib/auth';
import { ErrorWrongBody } from '../utils/error';

export async function authUserByGoogle(server: Server) {
  const body: { token: string } = server.body as any;

  if (!body.hasOwnProperty('token')) {
    server.respondError(new ErrorWrongBody('There is no needed googleToken'));
  }

  try {
    const user = await lib.getUserByGoogleToken(body.token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function authUserByFacebook(server: Server) {
  const body: { token: string } = server.body as any;

  if (!body.hasOwnProperty('token')) {
    server.respondError(new ErrorWrongBody('There is no needed facebookToken'));
    return;
  }

  try {
    const user = await lib.getUserByFacebookToken(body.token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function authUserByLogin(server: Server) {
  const body: { password: string; login: string } = server.body as any;
  console.log(body.password, body.login, 'login and password');

  // check for login and password
  if (!body.hasOwnProperty('password') || !body.hasOwnProperty('login')) {
    console.log('чего-то не хвататет');
    server.respondError(
      new ErrorWrongBody('There are no needed password and login'),
    );

    return;
  }

  try {
    const user = await lib.getUserByLoginParams(body.password, body.login);
    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function signUpUserByLogin(server: Server) {
  const body: { password: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('password') || !body.hasOwnProperty('login')) {
    server.respondError(
      new ErrorWrongBody('There are no needed password or login'),
    );
    return;
  }

  try {
    const user = await lib.signUpUserByLogin(body.password, body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function signUpUserByGoogle(server: Server) {
  const body: { token: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('token') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ErrorWrongBody('There are no needed googlToken or login'),
    );

    return;
  }

  try {
    const user = await lib.signUpUserByGoogle(body.token, body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function signUpUserByFacebook(server: Server) {
  const body: { token: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('token') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ErrorWrongBody('There are no needed facebookToken or login'),
    );

    return;
  }

  try {
    const user = await lib.signUpUserByFacebook(body.token, body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
