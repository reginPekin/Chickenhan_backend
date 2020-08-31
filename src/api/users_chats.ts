import { Server } from '../utils/server';

import { getUserByToken, updateUser, User } from '../lib/user';
import { getChatById, Chat } from '../lib/chats';
import * as lib from '../lib/users_chats';

import { ErrorWrongBody, ChickenhanError } from '../utils/error';

export async function getFullChats(server: Server, user?: User) {
  if (!user) {
    server.respondError(
      new ChickenhanError(403, 'No user', "Didn't find user by token"),
    );

    return;
  }

  const chatsPromise: Promise<Chat>[] = [];

  try {
    const user_chats = await lib.getUserChats(user.id);

    user_chats.chats.forEach((chat_id: number) => {
      const chat: Promise<Chat> = getChatById(chat_id);
      chatsPromise.push(chat);
    });

    try {
      const chats = await Promise.all(chatsPromise);

      server.respond(chats);
    } catch (error) {
      server.respondError(error);
    }
  } catch (error) {
    server.respondError(error);
  }
}

export async function getChats(server: Server) {
  if (!server.headers.hasOwnProperty('token')) {
    server.respondError(new ErrorWrongBody('There is no needed user token'));

    return;
  }

  try {
    const user = await getUserByToken(server.headers.token);
    const user_chats = await lib.getUserChats(user.id);

    server.respond(user_chats);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addChat(server: Server) {
  if (!server.headers.hasOwnProperty('token')) {
    server.respondError(new ErrorWrongBody('There is no needed user token'));

    return;
  }

  try {
    const user = await getUserByToken(server.headers.token);

    const user_chats = await lib.checkForUserChats(user.id);

    if (!user_chats) {
      await lib.addUserChats(user.id);
    }

    const updated_user_chats = await lib.addChatToUser(
      user.id,
      parseInt(server.pathParams.chat_id),
    );

    server.respond(updated_user_chats);
  } catch (error) {
    server.respondError(error);
  }
}

export async function removeChat(server: Server) {
  if (!server.headers.hasOwnProperty('token')) {
    server.respondError(new ErrorWrongBody('There is no needed user token'));

    return;
  }

  try {
    const user = await getUserByToken(server.headers.token);

    const user_chats = await lib.removeChat(
      user.id,
      parseInt(server.pathParams.chat_id),
    );

    server.respond(user_chats);
  } catch (error) {
    server.respondError(error);
  }
}

export async function countUsersWithChat(server: Server) {
  try {
    const user_count = await lib.countUsersWithChat(
      parseInt(server.pathParams.chat_id),
    );

    server.respond(user_count);
  } catch (error) {
    server.respondError(error);
  }
}
