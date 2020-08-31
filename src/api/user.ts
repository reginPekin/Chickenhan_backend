import { Server } from '../utils/server';

import { ErrorWrongBody, ErrorUserNotFoundByToken } from '../utils/error';

import * as lib from '../lib/user';

export async function getMe(server: Server, user?: lib.User) {
  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  try {
    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateMe(server: Server, user?: lib.User) {
  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  try {
    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getUser(server: Server) {
  try {
    const user = await lib.getUserById(parseInt(server.pathParams.id));

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addUserByLogin(server: Server) {
  const body: { login: string } = server.body as any;

  if (!body.hasOwnProperty('login')) {
    server.respondError(new ErrorWrongBody('There is no needed login'));

    return;
  }

  try {
    const user = await lib.addUserByLogin(body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateUser(server: Server) {
  try {
    const user = await lib.updateUser(
      parseInt(server.pathParams.id),
      server.body,
    );

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
