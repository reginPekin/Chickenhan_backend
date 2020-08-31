import {
  dbGet,
  dbAdd,
  dbAddToArray,
  dbDeleteFromArray,
  dbCountArray,
} from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface UsersChats {
  readonly user_id: number;

  chats: number[];
}

export async function getUserChats(user_id: number): Promise<UsersChats> {
  const user_chats = await dbGet<UsersChats>('users_chats', { user_id });

  if (!user_chats) {
    throw new ErrorNotFound('chats not found');
  }

  return user_chats;
}

export async function checkForUserChats(
  user_id: number,
): Promise<UsersChats | undefined> {
  const user_chats = await dbGet<UsersChats>('users_chats', { user_id });

  return user_chats;
}

export async function addUserChats(user_id: number): Promise<UsersChats> {
  const user_chats = await dbAdd<UsersChats>('users_chats', {
    user_id,
    chats: [],
  });

  return user_chats;
}

export async function addChatToUser(
  user_id: number,
  chat_id: number,
): Promise<UsersChats> {
  const user_chats = await dbAddToArray<UsersChats>(
    'users_chats',
    { chats: chat_id },
    { user_id },
  );

  return user_chats;
}

export async function removeChat(
  user_id: number,
  chat_id: number,
): Promise<UsersChats> {
  const user_chats = await dbDeleteFromArray<UsersChats>(
    'users_chats',
    { chats: chat_id },
    { user_id },
  );

  return user_chats;
}

export async function countUsersWithChat(chat_id: number): Promise<UsersChats> {
  const user_chats = await dbCountArray<UsersChats>('users_chats', {
    chats: chat_id,
  });

  return user_chats;
}