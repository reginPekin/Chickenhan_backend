import { Pool } from 'pg';

async function createTables() {
  const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  const TABLES = [
    `CREATE TABLE users (
      id SERIAL PRIMARY KEY NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      login VARCHAR(32) UNIQUE NOT NULL,
      online BOOL,
      avatar VARCHAR(255) NOT NULL
    );`,
    `CREATE TABLE auth_google
    (
      user_id INTEGER UNIQUE NOT NULL,
      google_token VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE auth_facebook
    (
      user_id INTEGER UNIQUE NOT NULL,
      facebook_token VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE auth_login
    (
      user_id INTEGER UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      login VARCHAR(32) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE messages
    (
      message_id BIGSERIAL PRIMARY KEY UNIQUE NOT NULL,
      author_id INTEGER NOT NULL,
      chat_id INTEGER NOT NULL,
      text TEXT,
      date DATE,
      pictures BIGINT[]
    );`,
    `CREATE TABLE chats
    (
      chat_id SERIAL PRIMARY KEY UNIQUE NOT NULL,
      type SMALLINT NOT NULL,
      avatar VARCHAR(255) NOT NULL,

      name VARCHAR(256) NOT NULL
    );`,
    `CREATE TABLE users_chats
    (
      user_id INTEGER PRIMARY KEY UNIQUE NOT NULL,
      chats INTEGER[]
    );`,
    `CREATE TABLE pictures
    (
      picture_id BIGINT PRIMARY KEY UNIQUE NOT NULL,
      type SMALLINT NOT NULL
    );
    `,
    `CREATE TABLE dialogs
    (
      user_id INTEGER,
      opponent_id INTEGER,
      chat_id INTEGER NOT NULL,
      PRIMARY KEY(user_id, opponent_id)
    );
    `,
  ];

  TABLES.map(async table => {
    await pool.query(table);
  });

  pool.end();
}

createTables();
