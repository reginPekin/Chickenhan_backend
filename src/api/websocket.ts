import { Client } from 'pg';
import * as WebSocket from 'ws';
import { User, getUserByToken } from '../lib/user';
import { setOnline, setOffline, addMessage, addDialog } from '../lib/websocket';

class ListenToWebsocket {
  private user: User | null;
  // private id: number;
  // private lookup: any;

  constructor() {
    this.user = null;
    // this.id = 0;
    // this.lookup = {};
  }

  public listenToWebsocket = (wss: WebSocket.Server) => {
    wss.on('connection', socket => {
      console.log('WWS WORKS!');

      console.log(wss.clients, 'CLIENTS');
      socket.on('message', async message => {
        const data = JSON.parse(message.toString());
        const type = data.type;
        console.log(data);
        if (!data.token) {
          console.log('no token');
          return;
        }

        this.user = await getUserByToken(data.token);

        if (type === 'set_online') {
          if (!this.user) {
            return;
          }

          setOnline(wss.clients, this.user, socket);
        }

        if (type === 'set_offline') {
          if (!this.user) {
            return;
          }

          setOffline(wss.clients, this.user, socket);
        }

        if (type === 'add_message') {
          console.log(data, 'DATA');
          if (!this.user || !data.message) {
            return;
          }

          const messageData = {
            chat_id: data.message.chat_id,
            author_id: this.user.id,
            text: data.message.text,
            pictures: data.message.pictures,
          };

          addMessage(wss.clients, this.user, socket, messageData);
        }

        if (type === 'add_dialog') {
          if (!this.user) {
            return;
          }

          addDialog(
            wss.clients,
            data.dialog_id,
            this.user.id,
            data.opponent_id,
          );
        }

        console.log(`Received message => ${message}`);
      });
      // socket.send('SOCKET IS ALIVE');
    });
  };
}

export const websocket = new ListenToWebsocket();
