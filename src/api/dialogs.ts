import { Server } from '../utils/server';

import * as lib from '../lib/dialogs';
import { User } from '../lib/user';

import {
  ErrorWrongBody,
  ErrorUserNotFoundByToken,
  ErrorNotFound,
  ChickenhanError,
} from '../utils/error';

export async function getDilog(server: Server, user?: User) {
  console.log(server, 'Server');

  if (!user) {
    server.respondError(new ErrorNotFound('not found user'));
    return;
  }

  if (!server.pathParams.opponent_id) {
    server.respondError(
      new ChickenhanError(
        404,
        'No needed pathparam',
        'There is no needed opponent id pathparam',
      ),
    );
    return;
  }

  try {
    const dialog = await lib.getDialog(
      user.id,
      parseInt(server.pathParams.opponent_id),
    );

    server.respond(dialog);
  } catch (error) {
    server.respondError(error);
  }
}
