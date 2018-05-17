import * as express from 'express';

const categories_router = express.Router();
const category_router = express.Router();

import Category from '../../models/schemas/categories';
import Course from '../../models/schemas/courses';

categories_router.get('/' , function (req, res) {
  const promise = Category.find({}).sort('level').exec();

  promise.then(
    (categories) => {
      res.status(200).json(categories);
    }
  ).catch(
    (err) => {
      res.status(500);
    }
  );
});

category_router.get('/:category_name/courses' , function (req, res) {
  const promise = Course.find({'category': req.params.category_name}).exec();

  promise.then(
    (courses) => {
      res.status(200).json(courses);
    }
  ).catch(
    (err) => {
      res.status(500);
    }
  );
});

module.exports = {
  categories: categories_router,
  category: category_router
};

