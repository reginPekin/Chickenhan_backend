import * as WebSocket from 'ws';
import { dbAdd, dbFullList, dbGet, dbGetFullByGroup } from '../utils/db';
import { getChatById } from './chats';
import { Dialogs } from './dialogs';
import {
  AddMessage,
  getUserWithMessage,
  Message,
  MessageWrapper,
} from './messages';
import { updateUser, User, UserWrap } from './user';

export async function setOnline(
  clients: Set<WebSocket>,
  user: User,
  socket: WebSocket,
): Promise<UserWrap> {
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

  const message = {
    user_dialogs,
    user_messages,
    type: 'set_online',
    user_id: user.id,
  };

  clients.forEach(client => {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  return onlineUser;
}

export async function setOffline(
  clients: Set<WebSocket>,
  user: User,
  socket: WebSocket,
): Promise<UserWrap> {
  const onlineUser = await updateUser(user.id, { online: false });

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

  const message = {
    user_dialogs,
    user_messages,
    type: 'set_offline',
    user_id: user.id,
  };

  clients.forEach(client => {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  return onlineUser;
}

export async function addMessage(
  clients: Set<WebSocket>,
  user: User,
  socket: WebSocket,
  { chat_id, author_id, text = '', pictures = [] }: AddMessage,
): Promise<MessageWrapper> {
  console.log('ADD MESSAGE');
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

  // clients.forEach(client => {
  //   if (client !== socket && client.readyState === WebSocket.OPEN) {
  //     client.send(
  //       JSON.stringify({ message: wrappedMessage, type: 'add_message' }),
  //     );
  //   }
  // });

  clients.forEach(client => {
    client.send(
      JSON.stringify({ message: wrappedMessage, type: 'add_message' }),
    );
  });

  return wrappedMessage;
}

export async function addDialog(
  clients: Set<WebSocket>,
  dialog_id: number,
  user_id: number,
  opponent_id: number,
) {
  const user_dialog = await getChatById(dialog_id, user_id);
  const opponent_dialog = await getChatById(dialog_id, opponent_id);

  console.log(user_dialog, opponent_dialog, 'DIALOOGS');

  const message = {
    type: 'add_dialog',
    user_id,
    opponent_id,
    user_dialog,
    opponent_dialog,
  };

  clients.forEach(client => {
    client.send(JSON.stringify(message));
  });
}
