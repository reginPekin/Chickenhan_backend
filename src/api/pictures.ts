import { Server } from '../utils/server';

import { ErrorWrongBody, ErrorUserNotFoundByToken } from '../utils/error';

import * as lib from '../lib/pictures';
import { ChatType } from '../lib/chats';

export async function addPicture(server: Server) {
  const body: { picture: string } = server.body as any;

  if (!body.picture) {
    server.respondError(new ErrorWrongBody('no needed picture'));
  }

  try {
    // const picture = await lib.addPicture(BigInt(body.picture));

    server.respond(0);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getPicture(server: Server) {
  console.log(server.pathParams, 'path params');
  try {
    const picture = await lib.getPicture(BigInt(server.pathParams.picture_id));

    server.respond(picture);
  } catch (error) {
    server.respondError(error);
  }
}
