import * as express from 'express';

import { Server, parseToServer } from './server';
import { API_PATH } from '../config';
import { User, getUserByToken } from '../lib/user';

export const app = express();

async function extractUser(token: string): Promise<User | undefined> {
  if (!token) {
    return undefined;
  }

  try {
    const user = await getUserByToken(token);
    return user;
  } catch {
    return undefined;
  }
}

export function get(
  destination: string,
  callback: (server: Server, user?: User | undefined) => any,
) {
  return app.get(API_PATH + destination, async (req, res) => {
    const server = parseToServer(req, res);

    const user = await extractUser(server.headers.token);

    callback(server, user);
  });
}

export function post(
  destination: string,
  callback: (server: Server, user?: User) => any,
) {
  return app.post(API_PATH + destination, async (req, res) => {
    const server = parseToServer(req, res);

    const user = await extractUser(server.headers.token);
    callback(server, user);
  });
}

export function patch(
  destination: string,
  callback: (server: Server, user?: User) => any,
) {
  return app.patch(API_PATH + destination, async (req, res) => {
    const server = parseToServer(req, res);

    const user = await extractUser(server.headers.token);
    callback(server, user);
  });
}

export function del(
  destination: string,
  callback: (server: Server, user?: User) => any,
) {
  return app.delete(API_PATH + destination, async (req, res) => {
    const server = parseToServer(req, res);

    const user = await extractUser(server.headers.token);
    callback(server, user);
  });
}
