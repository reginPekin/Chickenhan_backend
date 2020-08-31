import { dbAdd, dbGet, dbUpdate } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export enum ChatType {
  public = 1,
  dialog,
  private,
}

export interface Chat {
  readonly chat_id: number;

  avatar: string;
  type: ChatType;

  // dialog
  opponent_id?: number;

  // chat, dialog: name = opponent_name, user_count = 2
  name: string;
}

export interface AddChat {
  type: ChatType;
  name: string;

  avatar?: string;
  opponent_id: number;
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

export async function getChatById(chat_id: number): Promise<Chat> {
  const chat = await dbGet<Chat>('chats', { chat_id });

  if (!chat) {
    throw new ErrorNotFound('chat error not found');
  }

  // send default avatar url
  if (chat.avatar) {
    chat.avatar =
      'https://ic.pics.livejournal.com/davydov_index/60378694/1830248/1830248_original.jpg';
  }

  return chat;
}
