import { Server } from '../utils/server';

import * as lib from '../lib/user';

export async function getUser(server: Server) {
  try {
    const user = await lib.getUserByName(server.params.name);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addUser(server: Server) {
  const user = lib.addUser(server.body as any);

  server.respond(user);
}

export async function updateUser(server: Server) {
  const user = lib.updateUserByAge({
    name: server.params.name,
    age: server.params.age,
  });

  server.respond(user);
}
