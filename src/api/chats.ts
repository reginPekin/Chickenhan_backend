import { Server } from '../utils/server';

import * as lib from '../lib/chats';
import { ErrorWrongBody } from '../utils/error';

export async function getChatById(server: Server) {
  try {
    const chat = await lib.getChatById(server.params.chat_id);

    server.respond(chat);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addChat(server: Server) {
  const body: {
    type: lib.ChatType;
    name: string;
    avatar?: string;
  } = server.body as any;

  if (!body.hasOwnProperty('type') || !body.hasOwnProperty('name')) {
    server.respondError(
      new ErrorWrongBody('There is no needed chat type or chat name'),
    );

    return;
  }

  const opponent_id = body.type === 'dialog' ? server.params.opponent_id : 0;

  try {
    const chat = await lib.addChat({
      type: body.type,
      name: body.name,
      avatar: body.avatar,
      opponent_id,
    });

    server.respond(chat);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateChatById(server: Server) {
  try {
    const user = await lib.updateChatById(server.params.chat_id, server.body);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
