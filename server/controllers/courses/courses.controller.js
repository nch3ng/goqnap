var express = require('express')
var courses_router = express.Router();
var Course = require("../../models/courses");

courses_router.get('/', function (req, res) {
  var courses = [];
  console.log("get courses");
  let promise = Course.find({}).exec();

  promise.then(
    (courses)=>{
      this.courses = courses;
      res.json(this.courses);
    }).catch(error=>{
    })
});
module.exports = {
  courses: courses_router
} 