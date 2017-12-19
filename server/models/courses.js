var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code_name: {
    type: String,
    unique: true,
    required: true
  },
  desc: {
    type: String,
    require: true
  },
  keywords: {
    type: String
  },
  youtube_ref: {
    type: String,
    require: true
  },
  category: {
    type: String,
    require: true
  }
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;