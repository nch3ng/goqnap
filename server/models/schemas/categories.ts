import * as mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  img: String,
  level: Number,
  times: Number
});

const CategoryDB = mongoose.model('Category', categorySchema);

export default CategoryDB;
