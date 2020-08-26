import { Client } from 'pg';
import { UserManual, User } from '../lib/user';
import { AuthFacebook, AuthGoogle, AuthLogin } from '../lib/auth';
import { Message } from '../lib/messages';
import { Chat } from '../lib/chats';

import { ChickenhanError } from './error';

export type PostgresTable =
  | 'users'
  | 'authGoogle'
  | 'authFacebook'
  | 'authLogin'
  | 'messages'
  | 'chats';

export type DBRequestUpdate =
  | ['users', Partial<User>, Partial<User>]
  | ['authFacebook', Partial<AuthFacebook>, Partial<AuthFacebook>]
  | ['authGoogle', Partial<AuthGoogle>, Partial<AuthGoogle>]
  | ['authLogin', Partial<AuthLogin>, Partial<AuthLogin>]
  | ['messages', Partial<Message>, Partial<Message>]
  | ['chats', Partial<Chat>, Partial<Chat>];

export type DBRequestGet =
  | ['users', Partial<User>]
  | ['authGoogle', Partial<AuthGoogle>]
  | ['authFacebook', Partial<AuthFacebook>]
  | ['authLogin', Partial<AuthLogin>]
  | ['messages', Partial<Message>]
  | ['chats', Partial<Chat>];

export type DBRequestAdd =
  | ['users', UserManual]
  | ['authGoogle', AuthGoogle]
  | ['authFacebook', AuthFacebook]
  | ['authLogin', AuthLogin]
  | ['messages', Omit<Message, 'message_id'>]
  | ['chats', Omit<Chat, 'chat_id'>];

export type DBRequestDelete =
  | ['users', Partial<User>]
  | ['authGoogle', Partial<AuthGoogle>]
  | ['authFacebook', Partial<AuthFacebook>]
  | ['authLogin', Partial<AuthLogin>]
  | ['messages', Partial<Message>]
  | ['chats', Partial<Chat>];

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
});

export async function initPostgres() {
  // connect to db
  console.log('[postgre] поднимается');
  await client.connect();
  console.log('[postgre] поднялся');
}

// подготовить dbGET, доставать и менять user
export async function dbGet<T>(
  ...[table, queries]: DBRequestGet
): Promise<T | undefined> {
  const keys = Object.keys(queries);

  const query = `SELECT * FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }${keys.length - 1 !== index ? ' AND' : ''}`,
  )};`;

  const result = await client.query(query.replace(/,/g, ' '));

  if (result.rows.length <= 0) return;
  return result.rows[0];
}

function converJsToSqlArrays(array: any[]): string {
  return `{${array.map(element => element)}}`;
}

export async function dbAdd<T>(...[table, data]: DBRequestAdd): Promise<T> {
  // затестить и для массивов
  const fields = Object.keys(data);
  const values = Object.values(data);
  const bracketValues = values.map(value => {
    console.log(
      value,
      'value',
      typeof value === 'object',
      value.length || value.length === 0,
    );
    if (!(typeof value === 'object' && (value.length || value.length === 0))) {
      return `'${value}'`;
    }

    return `'${converJsToSqlArrays(value)}'`;
  });

  const query = `INSERT INTO ${table} (${fields.join(
    ', ',
  )}) VALUES (${bracketValues.join(', ')}) RETURNING *;`;

  console.log(query, 'query');

  const result = await client.query(query);

  if (result.rows.length <= 0)
    throw new ChickenhanError(502, 'DB died', 'Странная ошибка');

  return result.rows[0];
}

export async function dbUpdate<T>(
  ...[table, data, params]: DBRequestUpdate
): Promise<T> {
  const dataKeys = Object.keys(data);
  const paramsKey = Object.keys(params);

  const query = `UPDATE ${table}
   SET ${dataKeys.map(
     (key, index) =>
       `${index ? ' ' : ''}${
         typeof (data as any)[key] === 'string'
           ? `${key} = '${(data as any)[key]}'`
           : `${key} = ${(data as any)[key]}`
       }`,
   )}
   WHERE ${paramsKey.map(
     (param, index) =>
       `${index ? ' ' : ''}${
         typeof (params as any)[param] === 'string'
           ? `${param} = '${(params as any)[param]}'`
           : `${param} = ${(params as any)[param]}`
       }`,
   )} RETURNING *;`;

  const result = await client.query(query);

  if (result.rows.length <= 0)
    throw new ChickenhanError(502, 'DB died', 'Странная ошибка');

  return result.rows[0];
}

export async function dbDelete<T>(
  ...[table, queries]: DBRequestDelete
): Promise<T> {
  const keys = Object.keys(queries);

  const query = `DELETE FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }${keys.length - 1 !== index ? ' AND' : ''}`,
  )} RETURNING *;`;

  const result = await client.query(query);

  if (result.rows.length <= 0)
    throw new ChickenhanError(502, 'DB died', 'Странная ошибка');

  return result.rows[0];
}
