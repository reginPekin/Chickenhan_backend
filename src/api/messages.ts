import { Server } from '../utils/server';

import * as lib from '../lib/messages';
import { User, getUserWrapperById, UserWrap } from '../lib/user';
import { ErrorWrongBody, ErrorUserNotFoundByToken } from '../utils/error';

export async function getMessageById(server: Server) {
  console.log(server, 'server');

  try {
    const message = await lib.getMessageById(
      BigInt(server.pathParams.message_id),
    );

    server.respond(message);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getMessageList(server: Server) {
  console.log(server, 'server');

  try {
    const messageList = await lib.getMessageList(
      parseInt(server.pathParams.chat_id),
      10,
    );

    server.respond(messageList);
  } catch (error) {
    server.respondError(error);
  }
}

async function getUserWithMessage(
  message: lib.Message,
): Promise<lib.MessageWrapper> {
  const author: UserWrap = await getUserWrapperById(message.author_id);

  return { ...message, author };
}

export async function getMessages(server: Server) {
  console.log(server, 'server');

  if (!server.pathParams.chat_id) {
    server.respondError(
      new ErrorWrongBody('There is ni needed chat_id inside path params'),
    );
  }

  const messagePromise: Promise<lib.MessageWrapper>[] = [];

  try {
    const messageList = await lib.getListPagination(
      parseInt(server.pathParams.chat_id),
      parseInt(server.params.next_id) || undefined,
      parseInt(server.params.count) || 100,
    );

    messageList.list.forEach((message: lib.Message) => {
      const wrappedMessage: Promise<lib.MessageWrapper> = getUserWithMessage(
        message,
      );

      messagePromise.push(wrappedMessage);
    });

    try {
      const messages = await Promise.all(messagePromise);

      server.respond({ ...messageList, list: messages });
    } catch (error) {
      server.respondError(error);
    }
  } catch (error) {
    server.respondError(error);
  }
}

export async function deleteMessageById(server: Server) {
  console.log(server, 'server');

  try {
    const message = await lib.deleteMessageById(
      BigInt(server.pathParams.message_id),
    );

    server.respond(message);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addMessage(server: Server, user?: User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  const body: {
    pictures?: string[];
    text?: string;
  } = server.body as any;

  if (!body.hasOwnProperty('text') && !body.hasOwnProperty('pictures')) {
    server.respondError(
      new ErrorWrongBody('There is no needed pictures or text'),
    );

    return;
  }

  try {
    const chat_id = parseInt(server.pathParams.chat_id);

    const message = await lib.addMessage({
      chat_id,
      author_id: user.id,

      text: body.text,
      // pictures: body.pictures,
    });

    server.respond({ ...message, author: user });
  } catch (error) {
    server.respondError(error);
  }
}
