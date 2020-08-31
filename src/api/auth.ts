import { Server } from '../utils/server';

import * as lib from '../lib/auth';
import { ErrorWrongBody } from '../utils/error';

export async function authUserByGoogle(server: Server) {
  const body: { google_token: string } = server.body as any;

  if (!body.hasOwnProperty('google_token')) {
    server.respondError(new ErrorWrongBody('There is no needed google_token'));
  }

  try {
    const user = await lib.getUserByGoogleToken(body.google_token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function authUserByFacebook(server: Server) {
  const body: { facebook_token: string } = server.body as any;

  if (!body.hasOwnProperty('facebook_token')) {
    server.respondError(
      new ErrorWrongBody('There is no needed facebook_token'),
    );
    return;
  }

  try {
    const user = await lib.getUserByFacebookToken(body.facebook_token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function authUserByLogin(server: Server) {
  const body: { password: string; login: string } = server.body as any;

  // check for login and password
  if (!body.hasOwnProperty('password') || !body.hasOwnProperty('login')) {
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
  const body: { google_token: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('google_token') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ErrorWrongBody('There are no needed googlToken or login'),
    );

    return;
  }

  try {
    const user = await lib.signUpUserByGoogle(body.google_token, body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function signUpUserByFacebook(server: Server) {
  const body: { facebook_token: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('facebook_token') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ErrorWrongBody('There are no needed facebook_token or login'),
    );

    return;
  }

  try {
    const user = await lib.signUpUserByFacebook(
      body.facebook_token,
      body.login,
    );

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
