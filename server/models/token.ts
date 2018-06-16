import * as mongoose from 'mongoose';

export class Token {
  _userId: string;
  token: string;
  createdAt: Date;
}
