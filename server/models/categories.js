var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new mongoose.Schema({
  name: String
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;