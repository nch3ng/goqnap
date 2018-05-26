import { IResponse } from './interfaces/response.interface';
import { UserCreationResponse } from './user.model';
import { Course } from './course.model';

export interface GeneralResponse {
  success: boolean;
  message: string;
}

export class UserCourseResponse implements IResponse {
  success: boolean;
  message: string;
  course: Course;

  constructor(success: boolean, message: string, course: Course) {
    this.success = success;
    this.message = message;
    this.course = course;
  }
}

export class ErrorResponse extends UserCreationResponse {
}
