import { roleSchema } from './roles.schema';
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as mongoosePaginate from 'mongoose-paginate';

// const env = process.env.NODE_ENV || 'development';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  firstName: { 
    type: String,
    default: 'John'
  },
  lastName: { 
    type: String,
    default: 'Doe'
  },
  name: {
    type: String,
    default: 'John Doe'
  },
  favorites: {
    type: [String],
    default: []
  },
  hash: String,
  salt: String,
  lastLoginAt: Date,
  isVerified:  {
    type:Boolean,
    default: false
  }, 
  hasPasswordBeenSet: {
    type:Boolean,
    default: false
  },
  role: {
    type: roleSchema,
    default: () => {
      return {
        name: 'normal',
        level: 1,
        desc: 'Normal User'
      }
    }
  }
}, { usePushEach: true });

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 1); // Expired in 1 day

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: Math.trunc(expiry.getTime() / 1000),
  }, process.env.secret); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

userSchema.plugin(mongoosePaginate);

const UserDB = mongoose.model('User', userSchema);

export default UserDB;
