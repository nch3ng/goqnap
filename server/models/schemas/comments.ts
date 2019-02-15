import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

const commentSchema = new mongoose.Schema({
  owner_id: String,
  course_id: String,
  comment: String,
  createdAt: Number,
});

commentSchema.plugin(mongoosePaginate);
commentSchema.index({comment: 'text'}, { unique: false });
const CommentDB = mongoose.model('Comment', commentSchema);

export default CommentDB;
