import { Server } from '../utils/server';

import * as lib from '../lib/messages';
import { getUserByToken } from '../lib/user';
import { ErrorWrongBody } from '../utils/error';

export async function getMessageById(server: Server) {
  try {
    const message = await lib.getMessageById(server.params.message_id);

    server.respond(message);
  } catch (error) {
    server.respondError(error);
  }
}

export async function deleteMessageById(server: Server) {
  console.log(1);
  try {
    const message = await lib.deleteMessageById(server.params.message_id);

    server.respond(message);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addMessage(server: Server) {
  const body: {
    pictures?: string[];
    text?: string;
    token: string;
  } = server.body as any;

  if (
    !body.hasOwnProperty('token') ||
    (!body.hasOwnProperty('text') && !body.hasOwnProperty('pictures'))
  ) {
    server.respondError(
      new ErrorWrongBody('There is no needed pictures or text'),
    );

    return;
  }

  try {
    const author = await getUserByToken(body.token);
    const chat_id = parseInt(server.pathParams.chat_id);

    const message = await lib.addMessage({
      chat_id,
      author_id: author.id,

      text: body.text,
      pictures: body.pictures,
    });

    server.respond(message);
  } catch (error) {
    server.respondError(error);
  }
}
