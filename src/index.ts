import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';

import { app, get, post, patch } from './utils/express';

import { API_PORT } from './config';

import { initPostgres } from './utils/db';

import { getUser, addUser, updateUser } from './api/user';
import {
  authUserByFacebook,
  authUserByGoogle,
  authUserByMail,
} from './api/auth';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

get('/ping', server => server.respond('Pong'));

// REST API
get('/user', getUser);
post('/user', addUser);
patch('/user', updateUser);

post('/auth', authUserByFacebook);
post('/auth', authUserByGoogle);
post('/auth', authUserByMail);

initPostgres();

// Serving static
app.use(express.static(path.join(__dirname, 'web_static')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'web_static/index.html')),
);

app.listen(API_PORT, () => console.log('work'));
