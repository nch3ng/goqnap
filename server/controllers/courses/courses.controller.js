var express = require('express')
var courses_router = express.Router();

var Course = require("../../models/courses");

courses_router.get('/', function (req, res) {
  var courses = [];
  console.log("get courses");
  Course.find({}, function(err, courses){
    this.courses = courses;
    //console.log(courses);
    res.json(this.courses);
  });
  
});
module.exports = {
  courses: courses_router
} 