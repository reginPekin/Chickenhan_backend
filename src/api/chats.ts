import { Server } from '../utils/server';

import * as lib from '../lib/chats';
import { wrapChat } from './users_chats';
import {
  ErrorWrongBody,
  ErrorUserNotFoundByToken,
  ErrorNotFound,
  ChickenhanError,
} from '../utils/error';

import { User } from '../lib/user';
import { getDialogMembers } from '../lib/users_chats';

export async function getChatById(server: Server, user?: User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorNotFound('not found user'));
    return;
  }

  try {
    const chat = await lib.getChatById(
      parseInt(server.pathParams.chat_id),
      user.id,
    );

    if (chat.type === 'dialog') {
      const members = await getDialogMembers(chat.chat_id);
      const foundUser = members.filter(member => member.user_id === user.id);

      if (foundUser.length === 0)
        server.respondError(
          new ChickenhanError(
            403,
            'No access',
            'This chat has nothing to do with you',
          ),
        );
    }

    server.respond(chat);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addChat(server: Server, user?: User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  const body: {
    type: lib.StringChatType;
    name: string;
    avatar?: string;
  } = server.body as any;

  if (
    !body.hasOwnProperty('type') ||
    (!body.hasOwnProperty('name') && !server.pathParams.invited_user_id)
  ) {
    server.respondError(
      new ErrorWrongBody(
        'There is no needed chat type or chat name/invited user id',
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

  const invited_user_id = parseInt(
    body.type === 'dialog' ? server.pathParams.invited_user_id : '0',
  );
  try {
    const chat = await lib.addChat({
      user_id: user.id,
      type: setType(),
      name: body.name,
      avatar: body.avatar,
      invited_user_id,
    });
    const avatar =
      chat.avatar ||
      'https://ic.pics.livejournal.com/davydov_index/60378694/1830248/1830248_original.jpg';

    server.respond({ ...chat, type: body.type, avatar });
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateChatById(server: Server, user?: User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorNotFound('not found user'));
    return;
  }

  try {
    const chat = await lib.updateChatById(
      parseInt(server.pathParams.chat_id),
      user.id,
      server.body,
    );

    server.respond(chat);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getChats(server: Server, user?: User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorNotFound('not found user'));
    return;
  }

  const chatsPromise: Promise<lib.ChatWrapper>[] = [];

  try {
    const chatsList = await lib.getCommonChats(
      parseInt(server.params.next_id) || undefined,
      parseInt(server.params.count) || undefined,
    );

    chatsList.list.forEach((chat: lib.Chat) => {
      const fullChat: Promise<lib.ChatWrapper> = wrapChat(
        chat.chat_id,
        user.id,
      );
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
