import * as mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: String,
  level: Number,
  desc: Number
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
