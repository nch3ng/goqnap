import { Route, Get, Query, Controller } from 'tsoa';
import { Course } from '../../models/course.model';
import CourseDB from '../../models/schemas/courses';

@Route('courses')
export class CoursesController extends Controller {
  desc = true;
  orderBy = null;
  limit = 0;

  @Get()
  public getCourses(@Query() limit?: number, @Query() orderBy?: string): Promise<Course []> {

    if (orderBy && orderBy.split(':')[0]) {
      this.orderBy = orderBy.split(':')[0];
      if (orderBy.split(':')[1] && orderBy.split(':')[1] === 'desc') {
        this.desc = true;
      } else {
        this.desc = false;
      }
    }
    this.limit = limit;
    return new Promise<Course []>((resolve, reject) => {

      let sort;
      this.desc === true ? sort = '-' + this.orderBy : sort = this.orderBy;

      let promise;
      if (this.limit === 0) {
        promise = CourseDB.find({}).sort(sort).exec();
      } else {
        promise = CourseDB.find({}).sort(sort).limit(this.limit).exec();
      }

      promise.then(
        (courses: Course []) => {
          resolve(courses);
        }
      ).catch((error) => {
        reject(error);
      });
    });
  }

  @Get('{id}')
  public getCourse(id: string): Promise<Course> {
    return new Promise<Course>((resolve, reject) => {
      const promise = CourseDB.findOne({_id: id}).exec();
      promise.then(
        (course: Course) => {
          resolve(course);
        }
      ).catch(
        error => reject(error)
      );
    });
  }
}
