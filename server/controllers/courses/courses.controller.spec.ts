import { expect } from 'chai';
import 'mocha';
import { CoursesController } from '../../../dist/server/controllers/courses/courses.controller';

describe('Courses Test', () => {

  it('should get all courses', () => {
    const result = new CoursesController().getCourses();
    expect('Hello world!').equal('Hello world!');
  });

});
