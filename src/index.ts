import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as expressFormData from 'express-form-data';
import * as os from 'os';

import { app, get, post, patch, del } from './utils/express';

import { API_PORT } from './config';

import { initPostgres } from './utils/db';

import {
  createEventSource,
  setOffline,
  setOnline,
  addMessage,
} from './api/sse';
import {
  getMe,
  getUser,
  updateUser,
  updateMe,
  updateAvatar,
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
  getMessageById,
  deleteMessageById,
  getMessageList,
  getMessages,
} from './api/messages';
import { getDilog } from './api/dialogs';
import { addPicture, getPicture } from './api/pictures';
import * as chats from './api/chats';
import * as userChats from './api/users_chats';

app.use(cors());
app.options('*', cors());

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
};

app.use(expressFormData.parse(options));
app.use(expressFormData.format());
app.use(expressFormData.stream());
app.use(expressFormData.union());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser({ limit: '10mb' }));

get('/ping', server => {
  console.log('Pong');
  server.respond('Pong');
});

// REST API
app.get('/api/sse', createEventSource);
patch('/sse', setOnline);
del('/sse', setOffline);
post('/sse/message/:chat_id', addMessage);

get('/users/me', getMe);
get('/users/:id', getUser);
patch('/users/me', updateMe);
patch('/users/avatar', updateAvatar);
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

get('/chats/:chat_id', chats.getChatById);
get('/discover', chats.getChats);
patch('/chats/:chat_id', chats.updateChatById);
post('/chats/:invited_user_id', chats.addChat);

get('/dialogs/:opponent_id', getDilog);

get('/user-chats/full', userChats.getFullChats);
get('/user-chats', userChats.getChats);
patch('/user-chats/add/:chat_id', userChats.addChat);
patch('/user-chats/remove/:chat_id', userChats.removeChat);
patch('/user-chats/count/:chat_id', userChats.countUsersWithChat);
patch('/user-chats/members/:chat_id', userChats.getDialogMembers);

get('/pictures/:picture_id', getPicture);
post('/pictures', addPicture);

initPostgres();

// Serving static
app.use(express.static(path.join(__dirname, 'web_static')));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'web_static/index.html')),
);
app.get('/health-check', (req, res) => res.sendStatus(200));

app.listen(API_PORT, () => console.log('work'));
