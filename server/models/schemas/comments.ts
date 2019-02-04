import * as mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  owner_id: String,
  course_id: String,
  comment: String,
  createdAt: Number,
});

const CommentDB = mongoose.model('Comment', commentSchema);

export default CommentDB;
