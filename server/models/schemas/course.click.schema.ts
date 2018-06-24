import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const courseClickSchema = new mongoose.Schema({
  code_name: String,
  course_id: { type: Schema.Types.ObjectId, ref: 'CourseDB' },
  clickedAt: { type: Date, default: Date.now() }
});

courseClickSchema.pre('save', function (next) {
  if (!this.clickedAt) this.clickedAt = new Date;
  next();
})

const CourseClickDB = mongoose.model('CourseClick', courseClickSchema);

export default CourseClickDB;
