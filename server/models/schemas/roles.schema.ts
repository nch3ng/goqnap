import * as mongoose from 'mongoose';

export const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'normal'
  },
  level: {
    type: Number,
    default: 1
  },
  desc: {
    type: String,
    default: 'Normal User'
  }
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
