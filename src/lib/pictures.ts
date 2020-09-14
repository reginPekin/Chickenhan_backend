import * as fs from 'fs';
import * as path from 'path';
import * as buffer from 'buffer';

import { dbGet, dbAdd } from '../utils/db';
import { ErrorNotFound } from '../utils/error';

export enum PictureType {
  UserAvatar = 1,
  ChatAvatar,
  Message,
}

export interface Picture {
  readonly picture_id: BigInt;
  type: PictureType;
}

export function decodeB64(picture: string, picture_id: BigInt) {
  const cutPicture = picture.split('base64,')[1];
  const formatPart = picture.split('base64,')[0];
  const imageFormat = formatPart.slice(
    formatPart.indexOf('/') + 1,
    formatPart.indexOf(';'),
  );

  const Buffer = buffer.Buffer;
  var buf = Buffer.from(cutPicture, 'base64');

  fs.writeFile(
    // path.join('~/chickenhan/images/', `${picture_id}.${imageFormat}`),
    `${picture_id}.${imageFormat}`,
    buf,
    function (error) {
      if (error) {
        throw error;
      } else {
        console.log('File created from base64 string!');
        return true;
      }
    },
  );
}

export async function addPicture(type: PictureType): Promise<Picture> {
  console.log(type, 'picture type');
  const pictures = await dbAdd<Picture>('pictures', { type });

  console.log(pictures, 'pictures');
  if (!pictures) {
    throw new ErrorNotFound('add picture error');
  }

  return pictures;
}

export async function getPicture(picture_id: BigInt): Promise<Picture> {
  const picture = await dbGet<Picture>('pictures', { picture_id });

  if (!picture) {
    throw new ErrorNotFound('Picture not found');
  }

  return picture;
}
