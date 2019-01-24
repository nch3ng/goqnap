import * as mongoose from 'mongoose';
const user_expiry = process.env.user_expiry | 30;
export const tokenSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: user_expiry }
});

const TokenDB = mongoose.model('Token', tokenSchema);

export default TokenDB;
