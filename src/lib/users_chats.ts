import {
  dbGet,
  dbAdd,
  dbAddToArray,
  dbDeleteFromArray,
  dbCountArray,
  dbGetArraySpecialElements,
} from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface UsersChats {
  readonly user_id: number;

  chats: number[];
}

export async function getUserChats(user_id: number): Promise<UsersChats> {
  const user_chats = await dbGet<UsersChats>('users_chats', { user_id });

  console.log(user_chats);

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
  const user_chats = await checkForUserChats(user_id);

  if (!user_chats) {
    await addUserChats(user_id);
  }

  const updated_user_chats = await dbAddToArray<UsersChats>(
    'users_chats',
    { chats: chat_id },
    { user_id },
  );

  return updated_user_chats;
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

export async function countUsersWithChat(chat_id: number): Promise<number> {
  const chatAmount = await dbCountArray<{ count: string }>('users_chats', {
    chats: chat_id,
  });

  return parseInt(chatAmount.count);
}

export async function getDialogMembers(
  chat_id: number,
): Promise<{ user_id: number }[]> {
  const members = await dbGetArraySpecialElements<any>(
    'users_chats',
    'user_id',
    {
      chats: chat_id,
    },
  );

  return members;
}
