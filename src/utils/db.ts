import { Client } from 'pg';
import { query } from 'express';
import { User } from '../lib/user';
import { AuthFacebook, AuthGoogle, AuthMail } from '../lib/auth';

export type PostgresTable = 'users' | 'authGoogle' | 'authFacebook' | 'authMail'

export type DBRequestUpdate =
  | ['users', Partial<User>, Partial<User>]
  | ['authFacebook', Partial<AuthFacebook>, Partial<AuthFacebook>]
  | ['authGoogle', Partial<AuthGoogle>, Partial<AuthGoogle>]
  | ['authMail', Partial<AuthMail>, Partial<AuthMail>];

export type DBRequestGet =
  | ['users', Partial<User>]
  | ['authGoogle', Partial<AuthGoogle>]
  | ['authFacebook', Partial<AuthFacebook>]
  | ['authMail', Partial<AuthMail>];

export type DBRequestAdd =
  | ['users', User]
  | ['authGoogle', Partial<AuthGoogle>]
  | ['authFacebook', Partial<AuthFacebook>]
  | ['authMail', Partial<AuthMail]

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

export async function dbAdd(...[table, data]: DBRequestAdd) {
  // затестить и для массивов
  const fields = Object.keys(data);
  const values = Object.values(data);
  const bracketValues = values.map(value => `'${value}'`);

  const query = `INSERT INTO ${table} (${fields.join(
    ', ',
  )}) VALUES (${bracketValues.join(', ')});`;

  return client.query(query);
}

export async function dbUpdate(...[table, data, params]: DBRequestUpdate) {
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
   )};`;

  return client.query(query);
}
