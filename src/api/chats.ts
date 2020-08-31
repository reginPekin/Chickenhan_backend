import { Server } from '../utils/server';

import * as lib from '../lib/chats';
import { ErrorWrongBody } from '../utils/error';

type StringChatType = 'dialog' | 'public' | 'private';

function setStringType(enumType: lib.ChatType): StringChatType {
  switch (enumType) {
    case lib.ChatType.private:
      return 'private';
    case lib.ChatType.dialog:
      return 'dialog';
    case lib.ChatType.public:
      return 'public';
  }
}

export async function getChatById(server: Server) {
  try {
    const chat = await lib.getChatById(parseInt(server.pathParams.chat_id));

    const stringType: StringChatType = setStringType(chat.type);

    server.respond({ ...chat, type: stringType });
  } catch (error) {
    server.respondError(error);
  }
}

export async function addChat(server: Server) {
  const body: {
    type: StringChatType;
    name: string;
    avatar?: string;
  } = server.body as any;

  if (!body.hasOwnProperty('type') || !body.hasOwnProperty('name')) {
    server.respondError(
      new ErrorWrongBody('There is no needed chat type or chat name'),
    );

    return;
  }

  function setType(): lib.ChatType {
    switch (body.type) {
      case 'private':
        return lib.ChatType.private;
      case 'dialog':
        return lib.ChatType.dialog;
      case 'public':
        return lib.ChatType.public;
    }
  }

  const opponent_id = parseInt(
    body.type === 'dialog' ? server.pathParams.opponent_id : '0',
  );

  try {
    const chat = await lib.addChat({
      type: setType(),
      name: body.name,
      avatar: body.avatar,
      opponent_id,
    });

    server.respond({ ...chat, type: body.type });
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateChatById(server: Server) {
  try {
    const chat = await lib.updateChatById(
      parseInt(server.pathParams.chat_id),
      server.body,
    );

    const stringType: StringChatType = setStringType(chat.type);

    server.respond({ ...chat, type: stringType });
  } catch (error) {
    server.respondError(error);
  }
}
