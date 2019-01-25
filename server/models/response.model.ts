import { IResponse } from './interfaces/response.interface';
import { UserCreationResponse } from './user.model';
import { Course } from './course.model';

export interface IGeneralResponse {
  success: boolean;
  message: string;
  error_code?: number;
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

export class GeneralResponse implements IGeneralResponse {
  success: boolean;
  message: string;
 
  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

export class ErrorResponse implements IGeneralResponse {
  success: boolean;
  message: string;
  error_code: number;
 
  constructor(success: boolean, message: string, error_code: number) {
    this.success = success;
    this.message = message;
    this.error_code = error_code;
  }
}
