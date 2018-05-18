export interface ICourse {
  _id?: string;
  title: string;
  code_name: string;
  desc: string;
  keywords?: string;
  youtube_ref: string;
  category: string;
  watched?: number;
  rank?: number;
  createAt?: Date;
  publishedDate?: Date;
  like?: number;
  dislike?: number;
  favoriteCount?: number;
  duration?: string;
  commentCount?: number;
}
export class Course implements ICourse {
  _id?: string;
  title: string;
  code_name: string;
  desc: string;
  keywords: string;
  youtube_ref: string;
  category: string;
  watched?: number;
  rank?: number;
  createAt?: Date;
  publishedDate?: Date;
  like?: number;
  dislike?: number;
  favoriteCount?: number;
  duration?: string;
  commentCount?: number;

  constructor() {
    this.title = 'QNAP Tutorial Video';
    this.code_name = 'QNP000';
    this.desc = 'The description of the QNAP Tutorial Video - ' + this.code_name;
    this.category = 'junior';
    this.watched = 0;
    this.rank = 0;
    this.createAt = new Date();
    this.publishedDate = new Date();
    this.like = 0;
    this.dislike = 0;
    this.favoriteCount = 0;
    this.duration = '';
    this.commentCount = 0;
  }
}

export class UserCourseRequest implements ICourse {
  _id?: string;
  title: string;
  code_name: string;
  desc: string;
  keywords: string;
  youtube_ref: string;
  category: string;
  watched?: number;
  rank?: number;
  createAt?: Date;
  publishedDate?: Date;
  like?: number;
  dislike?: number;
  favoriteCount?: number;
  duration?: string;
  commentCount?: number;
}

export interface IResponse {
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
