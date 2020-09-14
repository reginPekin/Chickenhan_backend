import { Server } from '../utils/server';

import { ErrorWrongBody, ErrorUserNotFoundByToken } from '../utils/error';

import * as lib from '../lib/user';
import { addPicture, PictureType, decodeB64 } from '../lib/pictures';

export async function getMe(server: Server, user?: lib.User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  try {
    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateMe(server: Server, user?: lib.User) {
  console.log(server, 'server');

  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  try {
    const updatedUser = await lib.updateUser(user.id, server.body);

    server.respond(updatedUser);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateAvatar(server: Server, user?: lib.User) {
  const body: { picture: string } = server.body as any;

  if (!body.picture) {
    server.respondError(new ErrorWrongBody('There is no piture into body'));

    return;
  }

  if (!user) {
    server.respondError(new ErrorUserNotFoundByToken());

    return;
  }

  console.log(server, 'this is server');

  try {
    const addedPicture = await addPicture(PictureType.UserAvatar);
    decodeB64(body.picture, addedPicture.picture_id);

    server.respond(addedPicture);
  } catch (error) {
    server.respondError(error);
  }
}

export async function getUser(server: Server) {
  console.log(server, 'server');

  try {
    const user = await lib.getUserById(parseInt(server.pathParams.id));
    const { token, ...userWrapper } = user;

    server.respond(userWrapper);
  } catch (error) {
    server.respondError(error);
  }
}

export async function addUserByLogin(server: Server) {
  console.log(server, 'server');

  const body: { login: string } = server.body as any;

  if (!body.hasOwnProperty('login')) {
    server.respondError(new ErrorWrongBody('There is no needed login'));

    return;
  }

  try {
    const user = await lib.addUserByLogin(body.login);

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}

export async function updateUser(server: Server) {
  console.log(server, 'server');

  try {
    const user = await lib.updateUser(
      parseInt(server.pathParams.id),
      server.body,
    );

    server.respond(user);
  } catch (error) {
    server.respondError(error);
  }
}
