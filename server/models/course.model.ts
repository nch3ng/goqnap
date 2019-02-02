import { IResponse } from './interfaces/response.interface';
import { ICourse } from './interfaces/course.interface';

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
  slug: string;

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
    this.slug = 'qnap-tutorial-video';
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

export class YoutubeInfo implements YoutubeInfo {
  duration: string;
  like: number;
  dislike: number;
  watched: number;
  favoriteCount: number;
  commentCount: number;
  publishedDate: Date;

  constructor(
    duration: string,
    like: number,
    dislike: number,
    watched: number,
    favoriteCount: number,
    commentCount: number,
    publishedDate: Date,
  ) {
    this.duration = duration;
    this.like = like;
    this.dislike = dislike;
    this.watched = watched;
    this.favoriteCount = favoriteCount;
    this.commentCount = commentCount;
    this.publishedDate = publishedDate;
  }
}
