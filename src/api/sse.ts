import { ErrorUserNotFoundByToken, ErrorWrongBody } from '../utils/error';
import { Server } from '../utils/server';

import { User } from '../lib/user';
import * as lib from '../lib/sse';

export function createEventSource(...args: any[]) {
  console.log('sse check');
  lib.sse.init(...args);
  console.log('sse inited');
}

export async function setOnline(server: Server, user?: User) {
  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());
    return;
  }

  await lib.setOnline(user);

  // server.respond(onlineUser);
  server.respondOk();
}

export async function setOffline(server: Server, user?: User) {
  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());
    return;
  }

  const offlineUser = await lib.setOffline(user);

  // server.respond(offlineUser);
  server.respondOk();
}

export async function addMessage(server: Server, user?: User) {
  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  const body: {
    pictures?: string[];
    text?: string;
  } = server.body as any;

  if (!body.hasOwnProperty('text') && !body.hasOwnProperty('pictures')) {
    server.respondError(
      new ErrorWrongBody('There is no needed pictures or text'),
    );

    return;
  }

  try {
    const chat_id = parseInt(server.pathParams.chat_id);

    const message = await lib.addMessage({
      chat_id,
      author_id: user.id,

      text: body.text,
      // pictures: body.pictures,
    });

    server.respond({ ...message, author: user });
  } catch (error) {
    server.respondError(error);
  }
}
