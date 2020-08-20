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
      userId SERIAL UNIQUE NOT NULL,
      googleToken VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE authFacebook
    (
      userId SERIAL UNIQUE NOT NULL,
      facebookToken VARCHAR(255) PRIMARY KEY NOT NULL
    );`,
    `CREATE TABLE authMail
    (
      userId SERIAL UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      login VARCHAR(32) PRIMARY KEY NOT NULL
    );`,
  ];

  TABLES.map(async table => {
    await pool.query(table);
  });

  pool.end();
}

createTables();
