import { Server } from '../utils/server';

import * as lib from '../lib/user';
import { ChickenhanError } from '../utils/error';

export async function getMe(server: Server) {
  const body: { token: string } = server.body as any;

  if (!body.hasOwnProperty('token')) {
    server.respondError(
      new ChickenhanError(400, 'Wrong body', 'There is no needed user token'),
    );
    return;
  }

  try {
    const user = await lib.getUserByToken(body.token);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getUser(server: Server) {
  try {
    const user = await lib.getUserById(server.params.id);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addUserByLogin(server: Server) {
  const body: { login: string } = server.body as any;

  if (!body.hasOwnProperty('login')) {
    server.respondError(
      new ChickenhanError(400, 'Wrong body', 'There is no needed login'),
    );
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
    const user = await lib.updateUser(server.params.id, server.body);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
