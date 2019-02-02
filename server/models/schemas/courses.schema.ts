import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';
import { ICourse } from '../interfaces/course.interface';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code_name: {
    type: String,
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
    unique: true,
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
  },
  slug: {
    type: String,
    default: '',
    unique: true
  },
  slide_link: {
    type: String,
    default: ''
  }
});
courseSchema.plugin(mongoosePaginate);

courseSchema.index({title: 'text', code_name: 'text', desc: 'text', keywords: 'text', category: 'text'}, { unique: false });

const CourseDB = mongoose.model<ICourse>('Course', courseSchema);
CourseDB.on('index', function(error) {
  // "_id index cannot be sparse"
  // console.log(error);
});

export default CourseDB;
