import { Response, Request } from 'express';
import * as QueryString from 'qs';
import { IncomingHttpHeaders } from 'http';
import { ChickenhanError } from './error';

export interface Server {
  respond: (body: Object) => void;
  respondOk: () => void;
  // c Error
  respondError: (error: ChickenhanError) => void;

  params: { [key: string]: any };
  pathParams: { [key: string]: string };
  headers: IncomingHttpHeaders & { token: string };
  body: Object;
}

export function parseToServer(
  request: Request<{ [key: string]: string }, any, any, QueryString.ParsedQs>,
  response: Response<any>,
): Server {
  const server: Server = {
    params: request.query,
    pathParams: request.params,
    body: request.body as Object,
    headers: request.headers as any,
    respond: body => response.json(body),
    respondOk: () => response.json({ ok: true }),
    respondError: error => response.status(error.code).json({ error }), // ChickenhanError
  };

  return server;
}
