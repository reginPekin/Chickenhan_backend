import { Client } from 'pg';

import { UserManual, User } from '../lib/user';
import { AuthFacebook, AuthGoogle, AuthLogin } from '../lib/auth';
import { Message } from '../lib/messages';
import { Chat } from '../lib/chats';
import { UsersChats } from '../lib/users_chats';
import { Picture } from '../lib/pictures';
import { Dialogs } from '../lib/dialogs';

import { ErrorDb } from './error';

type Options = { count: number; sortBy: string };

type OptionsPagination = { sortBy: string; count?: number; start_id?: number };

export type PostgresTable =
  | 'users'
  | 'auth_google'
  | 'auth_facebook'
  | 'auth_login'
  | 'messages'
  | 'chats'
  | 'users_chats'
  | 'pictures'
  | 'dialogs';

export type DBRequestUpdate =
  | ['users', Partial<User>, Partial<User>]
  | ['auth_facebook', Partial<AuthFacebook>, Partial<AuthFacebook>]
  | ['auth_google', Partial<AuthGoogle>, Partial<AuthGoogle>]
  | ['auth_login', Partial<AuthLogin>, Partial<AuthLogin>]
  | ['messages', Partial<Message>, Partial<Message>]
  | ['chats', Partial<Chat>, Partial<Chat>];

export type DBRequestGet =
  | ['users', Partial<User>]
  | ['auth_google', Partial<AuthGoogle>]
  | ['auth_facebook', Partial<AuthFacebook>]
  | ['auth_login', Partial<AuthLogin>]
  | ['messages', Partial<Message>]
  | ['chats', Partial<Chat>]
  | ['users_chats', Partial<UsersChats>]
  | ['pictures', Partial<Picture>]
  | ['dialogs', Partial<Dialogs>];

export type DBRequestAdd =
  | ['users', UserManual]
  | ['auth_google', AuthGoogle]
  | ['auth_facebook', AuthFacebook]
  | ['auth_login', AuthLogin]
  | ['messages', Omit<Message, 'message_id'>]
  | ['chats', Omit<Chat, 'chat_id'>]
  | ['users_chats', UsersChats]
  | ['pictures', Partial<Picture>]
  | ['dialogs', Dialogs];

export type DBRequestDelete =
  | ['users', Partial<User>]
  | ['auth_google', Partial<AuthGoogle>]
  | ['auth_facebook', Partial<AuthFacebook>]
  | ['auth_login', Partial<AuthLogin>]
  | ['messages', Partial<Message>]
  | ['chats', Partial<Chat>];

export type DBRequestAddArray = [
  'users_chats',
  { chats: number },
  Partial<UsersChats>,
];

export type DBRequestCountArray = ['users_chats', { chats: number }];
export type DBRequestGetArrayElements = [
  'users_chats',
  'user_id',
  { chats: number },
];

export type DBRequestList = ['messages', Partial<Message>, Partial<Options>];

export type DBRequestFullList =
  | ['dialogs', Partial<Dialogs>, string[]]
  | ['messages', Partial<Message>, string[]];

export type DBRequestListPagination =
  | ['messages', Partial<Message>, OptionsPagination]
  | ['chats', Partial<Chat>, OptionsPagination];

export type DBRequestGetFullByGroup = [
  'messages',
  Partial<Message>,
  string[],
  string,
  string,
];

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
  if (result.rows.length <= 0) throw new ErrorDb();

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

  if (result.rows.length <= 0) throw new ErrorDb();

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

  if (result.rows.length <= 0) throw new ErrorDb();

  return result.rows[0];
}

export async function dbAddToArray<T>(
  ...[table, data, params]: DBRequestAddArray
): Promise<T> {
  const dataKeys = Object.keys(data);
  const paramsKey = Object.keys(params);

  const query = `UPDATE ${table}
   SET ${dataKeys.map(
     (key, index) =>
       `${index ? ' ' : ''}${
         typeof (data as any)[key] === 'string'
           ? `${key} = ARRAY_APPEND(${key}, '${(data as any)[key]}')`
           : `${key} = ARRAY_APPEND(${key}, ${(data as any)[key]})`
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
  console.log(query, 'query');

  const result = await client.query(query);

  if (result.rows.length <= 0) throw new ErrorDb();

  return result.rows[0];
}

export async function dbDeleteFromArray<T>(
  ...[table, data, params]: DBRequestAddArray
): Promise<T> {
  const dataKeys = Object.keys(data);
  const paramsKey = Object.keys(params);

  const query = `UPDATE ${table}
   SET ${dataKeys.map(
     (key, index) =>
       `${index ? ' ' : ''}${
         typeof (data as any)[key] === 'string'
           ? `${key} = ARRAY_REMOVE(${key}, '${(data as any)[key]}')`
           : `${key} = ARRAY_REMOVE(${key}, ${(data as any)[key]})`
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

  if (result.rows.length <= 0) throw new ErrorDb();

  return result.rows[0];
}

export async function dbCountArray<T>(
  ...[table, params]: DBRequestCountArray
): Promise<T> {
  const paramsKey = Object.keys(params);

  const query = `SELECT COUNT (*) 
    FROM ${table}
    WHERE ${paramsKey.map(
      (param, index) =>
        `${index ? ' ' : ''}${
          typeof (params as any)[param] === 'string'
            ? `${param} @> '{"${(params as any)[param]}"}'`
            : `${param} @> '{${(params as any)[param]}}'`
        }`,
    )};`;

  const result = await client.query(query);

  if (result.rows.length <= 0) throw new ErrorDb();

  return result.rows[0];
}

export async function dbGetArraySpecialElements<T>(
  ...[table, option, params]: DBRequestGetArrayElements
): Promise<any> {
  const paramsKey = Object.keys(params);

  const query = `SELECT ${option} 
    FROM ${table}
    WHERE ${paramsKey.map(
      (param, index) =>
        `${index ? ' ' : ''}${
          typeof (params as any)[param] === 'string'
            ? `${param} @> '{"${(params as any)[param]}"}'`
            : `${param} @> '{${(params as any)[param]}}'`
        }`,
    )};`;

  const result = await client.query(query);

  if (result.rows.length === 0) return [];

  return result.rows;
}

export async function dbFullList<T extends Array<any>>(
  ...[table, queries, params]: DBRequestFullList
): Promise<T> {
  const keys = Object.keys(queries);

  const query = `SELECT ${params.map(
    param => param,
  )} FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }${keys.length - 1 !== index ? ' AND' : ''}`,
  )};`;

  console.log(query, 'query');

  const result = await client.query(query);

  return result.rows as T;
}

export async function dbGetFullByGroup<T extends Array<any>>(
  ...[
    table,
    queries,
    params,
    groupedByParam,
    groupedIntoArrayParam,
  ]: DBRequestGetFullByGroup
): Promise<T> {
  const keys = Object.keys(queries);

  const query = `
    WITH CTE (${params.map(param => param)}) AS (
      SELECT ${params.map(param => param)} FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }${keys.length - 1 !== index ? ' AND' : ''}`,
  )})
    SELECT ${groupedByParam}
    ,array_agg(${groupedIntoArrayParam})
    FROM CTE
    GROUP BY ${groupedByParam};
  `;

  console.log(query, 'query');

  const result = await client.query(query);

  return result.rows as T;
}

export async function dbList<T extends Array<any>>(
  ...[table, queries, options]: DBRequestList
): Promise<T> {
  const defaultOptions = { count: 10, sortBy: 'message_id' };

  const keys = Object.keys(queries);

  const query = `SELECT * FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }${keys.length - 1 !== index ? ' AND' : ''}`,
  )} ORDER BY ${options.sortBy || defaultOptions.sortBy} DESC LIMIT ${
    options.count || defaultOptions.count
  };`;

  const result = await client.query(query);

  return result.rows as T;
}

export async function dbListPagination<T extends Array<any>>(
  ...[table, queries, options]: DBRequestListPagination
): Promise<{ list: T; next_from_id?: number; hasMore: boolean }> {
  const defaultOptions = { count: 10, start_id: undefined };

  const keys = Object.keys(queries);
  const count = options.count || defaultOptions.count;

  const query = `SELECT * FROM ${table} WHERE ${keys.map(
    (key: any, index) =>
      `${
        typeof (queries as any)[key] === 'string'
          ? `${key} = '${(queries as any)[key]}'`
          : `${key} = ${(queries as any)[key]}`
      }`,
  )} ${
    options.start_id !== undefined
      ? `AND ${options.sortBy} < ${options.start_id}`
      : ``
  } ORDER BY ${options.sortBy} DESC LIMIT ${count + 1};`;

  const result = await client.query(query);

  // если нет следующего элемента
  if (count + 1 !== result.rowCount) {
    return { list: result.rows as T, hasMore: false };
  }

  const next_from_id = result.rows[result.rowCount - 1][options.sortBy];
  const list: T = result.rows.slice(0, count) as T;

  return { list, next_from_id, hasMore: true };
}
