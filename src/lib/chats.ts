import { dbAdd, dbGet, dbUpdate, dbListPagination } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

import { getUserById } from './user';
import { countUsersWithChat } from './users_chats';

export enum ChatType {
  public = 1,
  dialog,
  private,
}

export interface Chat {
  readonly chat_id: number;

  avatar: string;
  type: ChatType;

  opponent_id?: number;

  name: string;
}

export interface AddChat {
  type: ChatType;
  name: string;

  avatar?: string;
  opponent_id: number;
}

interface Opponent {
  avatar: string;
  is_online: boolean;
  login: string;
}

export interface ChatWrapper {
  readonly chat_id: number;
  type: ChatType;

  avatar?: string;
  name?: string;
  user_count?: number;

  opponent?: Opponent;
}

export interface ChatFullWrapper extends ChatWrapper {
  last_message?: string;
  last_dateMessage?: string;
}

export async function addChat({
  type,
  name,
  avatar = '',
  opponent_id = 0,
}: AddChat): Promise<Chat> {
  const chat = {
    type,
    name,
    avatar,
    opponent_id,
  };

  const addedChat = await dbAdd<Chat>('chats', chat);

  return addedChat;
}

export async function updateChatById(
  chat_id: number,
  queries: Partial<Chat>,
): Promise<Chat> {
  return dbUpdate('chats', queries, { chat_id });
}

export async function getChatById(chat_id: number): Promise<ChatWrapper> {
  const chat = await dbGet<Chat>('chats', { chat_id });

  if (!chat) {
    throw new ErrorNotFound('chat error not found');
  }

  if (!chat.opponent_id && !chat.avatar) {
    chat.avatar =
      'https://ic.pics.livejournal.com/davydov_index/60378694/1830248/1830248_original.jpg';
  }

  if (chat.opponent_id) {
    const opponent = await getUserById(chat.opponent_id);

    const chatWrapper = {
      ...chat,
      opponent: {
        is_online: opponent.online,
        login: opponent.login,
        avatar: opponent.avatar,
      },
    };
    delete chatWrapper.opponent_id;
    delete chatWrapper.avatar;
    delete chatWrapper.name;

    return chatWrapper;
  }

  const chatAmount = await countUsersWithChat(chat.chat_id);
  delete chat.opponent_id;

  return { ...chat, user_count: chatAmount };
}

export async function getCommonChats(
  next_id?: number,
  count?: number,
): Promise<{
  list: Chat[];
  next_from_id?: number | undefined;
  hasMore: boolean;
}> {
  const chatsList = await dbListPagination<Chat[]>(
    'chats',
    { type: 1 },
    { count: 50, start_id: next_id, sortBy: 'chat_id' },
  );

  return chatsList;
}
