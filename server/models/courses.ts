import * as mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
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
  },
  watched: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  createAt: {
    type: Date
  },
  publishedDate: {
    type: Date
  },
  like: {
    type: Number,
    default: 0
  },
  dislike: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: ''
  },
  commentCount: {
    type: Number,
    default: 0
  }
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
