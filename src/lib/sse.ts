import * as SSE from 'express-sse';
import { dbFullList, dbGetFullByGroup, dbAdd } from '../utils/db';
import { getChatById } from './chats';
import {
  AddMessage,
  Message,
  getUserWithMessage,
  MessageWrapper,
} from './messages';
import { User, updateUser, UserWrap } from './user';

// export const sse = new SSE(['set_online', 'set_offline']);
export const sse = new SSE();
sse.on('error', (data: any) => {
  console.warn('ERROR!', data);
});
sse.on('connection', (client: any) => {
  client.res.setTimeout(0); // Disable timeout
  var count = 0;
  setTimeout(function () {
    client.send('message #' + count++);
  }, 1500);

  setTimeout(function () {
    client.send('message #' + count++);
  }, 150000);
});

// export type Event = 'set_online' | 'set_offline';

export async function setOnline(user: User): Promise<UserWrap> {
  const onlineUser = await updateUser(user.id, { online: true });

  const user_dialogs = await dbFullList<{ chat_id: number }[]>(
    'dialogs',
    { opponent_id: user.id },
    ['chat_id'],
  );

  const user_messages = await dbGetFullByGroup<{ message_id: BigInt }[]>(
    'messages',
    { author_id: user.id },
    ['message_id', 'chat_id'],
    'chat_id',
    'message_id',
  );

  sse.send({
    user_dialogs,
    user_messages,
    type: 'set_online',
    user_id: user.id,
  });

  return onlineUser;
}

export async function setOffline(user: User): Promise<UserWrap> {
  const offlineUser = await updateUser(user.id, { online: false });

  const user_dialogs = await dbFullList<{ chat_id: number }[]>(
    'dialogs',
    { opponent_id: user.id },
    ['chat_id'],
  );

  const user_messages = await dbGetFullByGroup<{ message_id: BigInt }[]>(
    'messages',
    { author_id: user.id },
    ['message_id', 'chat_id'],
    'chat_id',
    'message_id',
  );

  sse.send({
    user_dialogs,
    user_messages,
    type: 'set_offline',
    user_id: user.id,
  });

  return offlineUser;
}

export async function addMessage({
  chat_id,
  author_id,
  text = '',
  pictures = [],
}: AddMessage): Promise<MessageWrapper> {
  console.log('add message');
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const date = new Date(Date.now() - tzoffset).toISOString().slice(0, -1);
  // кладу в бд с картинками с возвращением их id

  const message = {
    chat_id,
    author_id,
    date,
    text,
    pictures: [],
  };
  const addedMessage = await dbAdd<Message>('messages', message);

  const wrappedMessage = await getUserWithMessage(addedMessage);
  console.log('send sse message');
  sse.send({
    type: 'send_message',
    message: wrappedMessage,
  });

  return wrappedMessage;
}

export async function addDialog(
  dialog_id: number,
  user_id: number,
  opponent_id: number,
): Promise<void> {
  const user_dialog = await getChatById(dialog_id, user_id);
  const opponent_dialog = await getChatById(dialog_id, opponent_id);

  sse.send({
    type: 'add_dialog',
    user_id,
    opponent_id,
    user_dialog,
    opponent_dialog,
  });
}
