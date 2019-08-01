import CourseDB from '../models/schemas/courses.schema';

export const isCourseValid = (id: string) => {
  return new Promise((resolve, reject) => {
    return CourseDB.find({'_id': id})
  });
}