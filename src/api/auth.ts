import { Server } from '../utils/server';

import * as lib from '../lib/auth';
import { ChickenhanError } from '../utils/error';

export async function authUserByGoogle(server: Server) {
  const body: { token: string } = server.body as any;

  if (!body.hasOwnProperty('token')) {
    server.respondError(
      new ChickenhanError(400, 'Wrong body', 'There is no needed googleToken'),
    );
    return;
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
    server.respondError(
      new ChickenhanError(
        400,
        'Wrong body',
        'There is no needed facebookToken',
      ),
    );
    return;
  }

  try {
    const user = await lib.getUserByFacebookToken(body.token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function authUserByMail(server: Server) {
  const body: { password: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('password') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ChickenhanError(
        400,
        'Wrong body',
        'There are no needed password and login',
      ),
    );
    return;
  }

  try {
    const user = await lib.getUserByMailParams(body.password, body.login);
    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function signUpUserByMail(server: Server) {
  const body: { password: string; login: string } = server.body as any;

  if (!body.hasOwnProperty('password') && !body.hasOwnProperty('login')) {
    server.respondError(
      new ChickenhanError(
        400,
        'Wrong body',
        'There are no needed password and login',
      ),
    );
    return;
  }

  try {
    const user = await lib.signUpUserByMail(body.password, body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
