import { Server } from '../utils/server';

import * as lib from '../lib/chats';
import { wrapChat } from './users_chats';
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

  if (
    !body.hasOwnProperty('type') ||
    (!body.hasOwnProperty('name') && !server.pathParams.opponent_id)
  ) {
    server.respondError(
      new ErrorWrongBody(
        'There is no needed chat type or chat name/opponent id',
      ),
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

    const avatar =
      chat.avatar ||
      'https://ic.pics.livejournal.com/davydov_index/60378694/1830248/1830248_original.jpg';

    server.respond({ ...chat, type: body.type, avatar });
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

export async function getChats(server: Server, second: any) {
  const chatsPromise: Promise<lib.ChatWrapper>[] = [];

  try {
    const chatsList = await lib.getCommonChats(
      parseInt(server.params.next_id) || undefined,
      parseInt(server.params.count) || undefined,
    );

    chatsList.list.forEach((chat: lib.Chat) => {
      const fullChat: Promise<lib.ChatWrapper> = wrapChat(chat.chat_id);
      chatsPromise.push(fullChat);
    });

    try {
      const chats = await Promise.all(chatsPromise);

      server.respond({ ...chatsList, list: chats });
    } catch (error) {
      server.respondError(error);
    }
  } catch (error) {
    server.respondError(error);
  }
}
