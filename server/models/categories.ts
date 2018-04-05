import * as mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  level: Number
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
