import * as mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  message: String,
  createdAt: Number,
  userId: String,
  action: String,
});

const Log = mongoose.model('Log', logSchema);

export default Log;
