import { Route, Get, Query } from 'tsoa';
import { CourseModel } from '../../models/course.model';
import Course from '../../models/schemas/courses';

@Route('courses')
export class CoursesController {
  desc = true;
  orderBy = null;
  limit = 0;

  @Get()
  public getCourses(@Query() args?: Object): Promise<CourseModel []> {
    if (args) {
      console.log(args);
      if (args['orderBy'] && args['orderBy'].split(':')[0]) {
        this.orderBy = args['orderBy'].split(':')[0];

        if (args['orderBy'].split(':')[1] && args['orderBy'].split(':')[1] === 'desc') {
          this.desc = true;
        } else {
          this.desc = false;
        }
      }

      if (args['limit']) {
        this.limit = +args['limit'];
      }
    }
    return new Promise<CourseModel []>((resolve, reject) => {

      let sort;
      this.desc === true ? sort = '-' + this.orderBy : sort = this.orderBy;

      let promise;
      if (this.limit === 0) {
        promise = Course.find({}).sort(sort).exec();
      } else {
        promise = Course.find({}).sort(sort).limit(this.limit).exec();
      }

      promise.then(
        (courses: CourseModel []) => {
          resolve(courses);
        }
      ).catch((error) => {
        reject(error);
      });
    });
  }

  @Get('{id}')
  public getCourse(id: string): Promise<CourseModel> {
    return new Promise<CourseModel>((resolve, reject) => {
      const promise = Course.findOne({_id: id}).exec();
      promise.then(
        (course: CourseModel) => {
          resolve(course);
        }
      ).catch(
        error => reject(error)
      );
    });
  }
}
