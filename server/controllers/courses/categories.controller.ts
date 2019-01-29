import { GeneralResponse } from './../../models/response.model';
import { Course } from './../../models/course.model';
import { Category } from './../../models/category.model';
import { Controller, Get, Route } from 'tsoa';
import CategoryDB from '../../models/schemas/categories';
import CourseDB from '../../models/schemas/courses.schema';
import { ErrorResponse } from '../../models/response.model';
import * as ResponseCode from '../../codes/response';

@Route('categories')
export class CategoriesController extends Controller {

  @Get()
  public async getAll(): Promise<Category []>  {
    return new Promise<Category []>((resolve, reject) => {
      const promise = CategoryDB.find({}).sort('level');

      promise.then(
        categories => resolve(categories)).catch(
        (err) => {
          reject(new ErrorResponse(false, err, ResponseCode.GENERAL_ERROR));
        }
      );
    });
  }
}

@Route('category')
export class CategoryController {

  _category = 'freshman';

  constructor(category?: string) {
    // console.log(category);
    if (category) {
      this._category = category;
    }
  }
  set category(name: string) {
    this._category = name;
  }

  get category() {
    return this._category;
  }

  @Get('{category}/clicked')
  public async clicked(category?: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve,reject) => {
    CategoryDB.findOneAndUpdate(
      { 
        name: category
      },{
        $inc: { times: 1}
      }
    ).then(()=>{
      resolve(new GeneralResponse(true, 'Success', ResponseCode.GENERAL_SUCCESS));
    }).catch(
      (err) => {
        reject(new ErrorResponse(false, err, ResponseCode.GENERAL_ERROR));
      });
    });
  }

  @Get('{category}/courses')
  public async getCoursesByCategory(category?: string): Promise<Course []> {
    return new Promise<Course []>((resolve, reject) => {
      if (!category && !this.category) {
        reject(new ErrorResponse(false, 'Please determine a category', ResponseCode.GENERAL_ERROR));
      }
      if (category) {
        this.category = category;
      }
      const promise = CourseDB.find({'category': this._category}).sort('code_name');

      promise.then(
        (cat_courses: Course []) => {
          resolve(cat_courses);
        }).catch(
        (err) => {
          reject(new ErrorResponse(false, err, ResponseCode.GENERAL_ERROR));
        }
      );
    });
  }
}
