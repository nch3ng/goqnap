import { Course } from './../../models/course.model';
import { Category } from './../../models/category.model';
import { CategoriesController, CategoryController } from './../../controllers/courses/categories.controller';
import * as express from 'express';

const categories_router = express.Router();
const category_router = express.Router();

import CategoryDB from '../../models/schemas/categories';
import CourseDB from '../../models/schemas/courses';

categories_router.get('/' , function (req, res) {
  new CategoriesController().getAll().then(
    (categories: Category []) => {
      res.json(categories);
    }
  ).catch(error => res.status(500).json(error));
});

category_router.get('/:category_name/courses' , function (req, res) {

  new CategoryController(req.params.category_name).getCourses().then(
    (courses: Course []) => {
      res.json(courses);
    }
  ).catch(error => res.status(500).json(error));
});

module.exports = {
  categories: categories_router,
  category: category_router
};
