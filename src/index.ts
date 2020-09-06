import * as express from 'express';
import * as connectTimeout from 'connect-timeout';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { app, get, post, patch, del } from './utils/express';

import { API_PORT } from './config';

import { initPostgres } from './utils/db';

import {
  getMe,
  getUser,
  updateUser,
  updateMe,
  addUserByLogin,
} from './api/user';
import {
  authUserByFacebook,
  authUserByGoogle,
  authUserByLogin,
  signUpUserByLogin,
  signUpUserByGoogle,
  signUpUserByFacebook,
} from './api/auth';
import {
  addMessage,
  getMessageById,
  deleteMessageById,
  getMessageList,
  getMessages,
} from './api/messages';
import * as chats from './api/chats';
import * as userChats from './api/users_chats';

app.use(cors());
app.options('*', cors());

app.use(connectTimeout('5s'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser({ limit: '10mb' }));

get('/ping', server => server.respond('Pong'));

// REST API
get('/users/me', getMe);
get('/users/me', updateMe);
get('/users/:id', getUser);
patch('/users/me', updateMe);
patch('/users/:id', updateUser);
post('/users/login', addUserByLogin);

post('/auth/facebook', authUserByFacebook);
post('/auth/google', authUserByGoogle);
post('/auth/login', authUserByLogin);

post('/auth/new/login', signUpUserByLogin);
post('/auth/new/google', signUpUserByGoogle);
post('/auth/new/facebook', signUpUserByFacebook);

get(`/messages/:message_id`, getMessageById);
get(`/messages/list/:chat_id`, getMessageList);
get(`/messages/pagination/:chat_id`, getMessages);
del(`/messages/:message_id`, deleteMessageById);
post(`/messages/:chat_id`, addMessage);

get('/chats/:chat_id', chats.getChatById);
get('/discover', chats.getChats);
patch('/chats/:chat_id', chats.updateChatById);
post('/chats/:opponent_id', chats.addChat);

get('/user-chats/full', userChats.getFullChats);
get('/user-chats', userChats.countUsersWithChat);
patch('/user-chats/add/:chat_id', userChats.addChat);
patch('/user-chats/remove/:chat_id', userChats.removeChat);
patch('/user-chats/count/:chat_id', userChats.countUsersWithChat);

initPostgres();

// Serving static
app.use(express.static(path.join(__dirname, 'web_static')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'web_static/index.html')),
);

app.listen(API_PORT, () => console.log('work'));
