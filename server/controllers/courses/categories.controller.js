var express = require('express')
var categories_router = express.Router();
var category_router = express.Router();

var Category = require("../../models/categories");
var Course = require("../../models/courses");

categories_router.get('/' , function (req, res) {
  Category.find({}, function(err, categories){
     res.json(categories);
  });
})

category_router.get('/:category_name/allCourses' , function (req, res) {
  Course.find({"category": req.params.category_name}, function (err, courses) {
    if (err) return handleError(err);
    res.json(courses);
  });
});

module.exports = {
  categories: categories_router,
  category: category_router
}