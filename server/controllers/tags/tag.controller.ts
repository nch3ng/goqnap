import { Course } from '../../models/course.model';
import { Route, Controller, Get, Query, Path } from 'tsoa';
import CourseDB from '../../models/schemas/courses.schema';
import { GeneralResponse } from '../../models/response.model';
import * as ResponseCode from '../../codes/response';
@Route('tag')
export class TagController extends Controller {

  @Get('{name}')
  public async getCourses(@Path() name: string, @Query() limit?: number, @Query() orderBy?: string, @Query() category?: string, @Query() page?: number): Promise<Course []> {
    // console.log('get tag [' + name + ']');
    name = name.toLowerCase();
    const search = name.replace(/ /g, "\\s");
    return new Promise<Course []>((resolve, reject) => {
      // CourseDB.find({keywords: { "$regex": name, "$options": "i" }}, (err, courses) => {
      //   if (err) return reject(new GeneralResponse(false, 'No courses', ResponseCode.GENERAL_ERROR));

      //   return resolve(courses);
      // });
      CourseDB.find({}, (err, courses) => {
        if (err) return reject(new GeneralResponse(false, 'No courses', ResponseCode.GENERAL_ERROR));

        const r_courses = courses.filter((course) => {
          const keywords: string [] = course.keywords.toLowerCase().split(',');
          // console.log(keywords);
          if (keywords.includes(name)){
            // console.log(keywords);
            return true;
          } else {
            return false;
          }
        })
        return resolve(r_courses);
      })
    });
  }
}