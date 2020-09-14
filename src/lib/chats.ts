import { dbAdd, dbGet, dbUpdate, dbListPagination } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

import { getUserById, User } from './user';
import {
  countUsersWithChat,
  addChatToUser,
  getDialogMembers,
} from './users_chats';

export enum ChatType {
  public = 1,
  dialog,
  private,
}

export type StringChatType = 'dialog' | 'public' | 'private';

export function setStringType(enumType: ChatType): StringChatType {
  switch (enumType) {
    case ChatType.private:
      return 'private';
    case ChatType.dialog:
      return 'dialog';
    case ChatType.public:
      return 'public';
  }
}

export interface Chat {
  readonly chat_id: number;

  avatar: string;
  type: ChatType;

  name: string;
}

export interface AddChat {
  type: ChatType;
  user_id: number;

  name?: string;
  invited_user_id?: number;
  avatar?: string;
}

interface Opponent {
  avatar: string;
  is_online: boolean;
  login: string;
}

export interface ChatWrapper {
  readonly chat_id: number;
  type: StringChatType;

  avatar?: string;
  name?: string;
  user_count?: number;

  opponent?: Opponent;
}

export interface ChatFullWrapper extends ChatWrapper {
  last_message?: string;
  last_dateMessage?: string;
}

export async function wrapChat(
  chat: Chat,
  user_id: number,
): Promise<ChatWrapper> {
  const stringType: StringChatType = setStringType(chat.type);

  if (chat.type === 2) {
    const dialogMembers = await getDialogMembers(chat.chat_id);
    const opponent = await getOpponent(user_id, dialogMembers);

    const chatWrapper = {
      ...chat,
      type: stringType,
      opponent: {
        is_online: opponent.online,
        login: opponent.login,
        avatar: opponent.avatar,
      },
    };

    const { avatar, name, ...wrappedChat } = chatWrapper;

    return wrappedChat;
  }

  if (!chat.avatar) {
    chat.avatar =
      'https://ic.pics.livejournal.com/davydov_index/60378694/1830248/1830248_original.jpg';
  }

  const chatAmount = await countUsersWithChat(chat.chat_id);
  return { ...chat, user_count: chatAmount, type: stringType };
}

export async function addChat({
  user_id,
  type,
  invited_user_id,
  name = '',
  avatar = '',
}: AddChat): Promise<ChatWrapper> {
  const chat = {
    type,
    name,
    avatar,
  };

  const addedChat = await dbAdd<Chat>('chats', chat);

  if (invited_user_id && user_id) {
    await addChatToUser(invited_user_id, addedChat.chat_id);
    await addChatToUser(user_id, addedChat.chat_id);
  }

  return wrapChat(addedChat, user_id);
}

export async function updateChatById(
  chat_id: number,
  user_id: number,
  queries: Partial<Chat>,
): Promise<ChatWrapper> {
  const updatedChat = await dbUpdate<Chat>('chats', queries, { chat_id });

  return wrapChat(updatedChat, user_id);
}

async function getOpponent(
  user_id: number,
  members: { user_id: number }[],
): Promise<User> {
  const opponents = members.filter(member => member.user_id !== user_id);
  if (opponents.length === 0) throw new ErrorNotFound('not founded opponent');

  const opponent_id = opponents[0].user_id;
  const opponent = await getUserById(opponent_id);

  return opponent;
}

export async function getChatById(
  chat_id: number,
  user_id: number,
): Promise<ChatWrapper> {
  const chat = await dbGet<Chat>('chats', { chat_id });
  if (!chat) {
    throw new ErrorNotFound('chat error not found');
  }

  return wrapChat(chat, user_id);
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
    { count: 100, start_id: next_id, sortBy: 'chat_id' },
  );

  return chatsList;
}
