import * as express from 'express';

import { Server, parseToServer } from './server';
import { API_PATH } from '../config';

export const app = express();

export function get(destination: string, callback: (server: Server) => any) {
  return app.get(API_PATH + destination, (req, res) => {
    const server = parseToServer(req, res);
    callback(server);
  });
}

export function post(destination: string, callback: (server: Server) => any) {
  return app.post(API_PATH + destination, (req, res) => {
    const server = parseToServer(req, res);
    callback(server);
  });
}

export function patch(destination: string, callback: (server: Server) => any) {
  return app.patch(API_PATH + destination, (req, res) => {
    const server = parseToServer(req, res);
    callback(server);
  });
}

export function del(destination: string, callback: (server: Server) => any) {
  return app.delete(API_PATH + destination, (req, res) => {
    const server = parseToServer(req, res);
    callback(server);
  });
}
