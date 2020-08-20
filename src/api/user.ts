import { Server } from '../utils/server';

import * as lib from '../lib/user';

export async function getUser(server: Server) {
  try {
    const user = await lib.getUserById(server.params.id);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addUser(server: Server) {
  try {
    const user = lib.addUser(server.body as any);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateUser(server: Server) {
  try {
    const user = lib.updateUser(server.params.id, server.body);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
