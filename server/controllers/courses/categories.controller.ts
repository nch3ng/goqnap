import { Course } from './../../models/course.model';
import { Category } from './../../models/category.model';
import { Controller, Get, Route } from 'tsoa';
import CategoryDB from '../../models/schemas/categories';
import CourseDB from '../../models/schemas/courses';

@Route('categories')
export class CategoriesController extends Controller {

  @Get()
  getAll(): Promise<Category []>  {
    return new Promise<Category []>((resolve, reject) => {
      const promise = CategoryDB.find({}).sort('level').exec();

      promise.then(
        (categories: Category []) => {
          resolve(categories);
        }
      ).catch(
        (err) => {
          reject(err);
        }
      );
    });
  }
}

@Route('category')
export class CategoryController {

  _category = 'freshman';

  constructor(category?: string) {
    console.log(category);
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

  @Get('{category_name}/courses')
  getCourses(category?: string): Promise<Course []> {
    return new Promise<Course []>((resolve, reject) => {
      if (!category && !this.category) {
        reject('Please determine a category');
      }
      if (category) {
        this.category = category;
      }
      const promise = CourseDB.find({'category': this._category}).exec();

      promise.then(
        (courses: Course []) => {
          resolve(courses);
        }
      ).catch(
        (err) => {
          reject(err);
        }
      );
    });
  }
}
