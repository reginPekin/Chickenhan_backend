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
    `CREATE TABLE authGoogle
    (
      user_id INTEGER UNIQUE NOT NULL,
      googleToken VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE authFacebook
    (
      user_id INTEGER UNIQUE NOT NULL,
      facebookToken VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE authLogin
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
      date VARCHAR(32),
      pictures BIGINT[]
    );`,
    `CREATE TABLE chats
    (
      chat_id BIGSERIAL PRIMARY KEY UNIQUE NOT NULL,
      type VARCHAR(32) NOT NULL,
      avatar VARCHAR(255) NOT NULL,

      last_date_message VARCHAR(32),
      last_message TEXT,

      name VARCHAR(32) NOT NULL,
      user_count INTEGER NOT NULL,

      opponent_id INTEGER
    );`,
    `CREATE TABLE usersChats
    (
      user_id INTEGER PRIMARY KEY UNIQUE NOT NULL,
      chats BIGSERIAL[]
    );`,
  ];

  TABLES.map(async table => {
    await pool.query(table);
  });

  pool.end();
}

createTables();
