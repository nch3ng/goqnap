import * as express from 'express';

const categories_router = express.Router();
const category_router = express.Router();

import Category from '../../models/categories';
import Course from '../../models/courses';

categories_router.get('/' , function (req, res) {
  console.log(req.body);
  Category.find({}, (err, r_categories) => {
     res.json(r_categories);
  });
});

category_router.get('/:category_name/allCourses' , function (req, res) {
  Course.find({'category': req.params.category_name}, function (err, courses) {
    if (err) {
      return res.status(500).json({});
    }
    res.json(courses);
  });
});

module.exports = {
  categories: categories_router,
  category: category_router
};

