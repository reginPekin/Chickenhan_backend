import { dbAdd, dbGet } from '../utils/db';

import { ChatWrapper, addChat, getChatById, ChatType } from './chats';
import { addDialog } from './sse';

export interface Dialogs {
  user_id: number;
  opponent_id: number;
  chat_id: number;
}

export async function getDialog(
  user_id: number,
  opponent_id: number,
): Promise<ChatWrapper> {
  const dialog = await dbGet<Dialogs>('dialogs', { user_id, opponent_id });

  if (!dialog) {
    const addedDialog = await addChat({
      user_id,
      type: ChatType.dialog,
      invited_user_id: opponent_id,
    });

    await dbAdd<Dialogs>('dialogs', {
      user_id,
      opponent_id,
      chat_id: addedDialog.chat_id,
    });

    await dbAdd<Dialogs>('dialogs', {
      opponent_id: user_id,
      user_id: opponent_id,
      chat_id: addedDialog.chat_id,
    });

    addDialog(addedDialog.chat_id, user_id, opponent_id);
    return addedDialog;
  }

  const chat_id = dialog.chat_id;
  const chat = await getChatById(chat_id, user_id);

  return chat;
}
