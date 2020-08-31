import { dbGet, dbAdd, dbDelete, dbList, dbListPagination } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export interface Message {
  chat_id: number;
  author_id: number;

  message_id: BigInt;
  date: string;

  text: string;
  pictures: BigInt[];
}

export interface AddMessage {
  chat_id: number;
  author_id: number;

  text?: string;
  pictures?: string[];
}

export async function addMessage({
  chat_id,
  author_id,
  text = '',
  pictures = [],
}: AddMessage): Promise<Message> {
  const date = new Date().toISOString();

  // кладу в бд с картинками с возвращением их id

  const message = {
    chat_id,
    author_id,
    date,
    text,
    pictures: [],
  };

  return dbAdd('messages', message);
}

export async function getMessageById(message_id: BigInt): Promise<Message> {
  const message = await dbGet<Message>('messages', { message_id });

  if (!message) {
    throw new ErrorNotFound('message error not found');
  }

  return message;
}

export async function deleteMessageById(message_id: BigInt): Promise<Message> {
  const message = await dbDelete<Message>('messages', { message_id });

  if (!message) {
    throw new ErrorNotFound('message error not found');
  }

  return message;
}

export async function getMessageList(
  chat_id: number,
  count?: number,
): Promise<Message[]> {
  const messageList = await dbList<Message[]>(
    'messages',
    { chat_id },
    { count },
  );

  if (!messageList) {
    throw new ErrorNotFound('messageList not found');
  }

  return messageList;
}

export async function getListPagination(
  chat_id: number,
  next_id?: number,
  count?: number,
): Promise<{
  list: Message[];
  next_from_id?: number | undefined;
  hasMore: boolean;
}> {
  const messageList = await dbListPagination<Message[]>(
    'messages',
    { chat_id },
    { count, start_id: next_id, sortBy: 'message_id' },
  );

  return messageList;
}
