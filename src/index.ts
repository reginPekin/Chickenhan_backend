import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';

import { app, get, post, patch } from './utils/express';

import { API_PORT } from './config';

import { initPostgres } from './utils/db';

import { getMe, getUser, updateUser, addUserByLogin } from './api/user';

import {
  authUserByFacebook,
  authUserByGoogle,
  authUserByMail,
  signUpUserByMail,
  signUpUserByGoogle,
  signUpUserByFacebook,
} from './api/auth';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

get('/ping', server => server.respond('Pong'));

// REST API
get('/users/me', getMe);
get('/users', getUser);
patch('/users', updateUser);
post('/users/login', addUserByLogin);

post('/auth/facebook', authUserByFacebook);
post('/auth/google', authUserByGoogle);
post('/auth/mail', authUserByMail);

post('/auth/new/mail', signUpUserByMail);
post('/auth/new/google', signUpUserByGoogle);
post('/auth/new/facebook', signUpUserByFacebook);

initPostgres();

// Serving static
app.use(express.static(path.join(__dirname, 'web_static')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'web_static/index.html')),
);

app.listen(API_PORT, () => console.log('work'));
