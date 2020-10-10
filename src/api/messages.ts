import { Server } from '../utils/server';

import * as lib from '../lib/messages';
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
      100,
    );

    server.respond(messageList);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getMessages(server: Server) {
  console.log(server, 'server');

  if (!server.pathParams.chat_id) {
    server.respondError(
      new ErrorWrongBody('There is no needed chat_id inside path params'),
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
      const wrappedMessage: Promise<lib.MessageWrapper> = lib.getUserWithMessage(
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
