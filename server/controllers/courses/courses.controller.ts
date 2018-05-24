import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete } from 'tsoa-nc';
import { Course, UserCourseRequest, UserCourseResponse, YoutubeInfo } from '../../models/course.model';
import CourseDB from '../../models/schemas/courses';
import * as YouTube from 'youtube-node';
import { ErrorResponse } from '../../models/response.model';

@Route('courses')
export class CoursesController extends Controller {
  desc = true;
  orderBy = 'publishedDate';
  limit = 0;
  category = null;
  dbQuery = {};

  @Get()
  public async getCourses(@Query() limit?: number, @Query() orderBy?: string, @Query() category?: string): Promise<Course []> {

    this.setOrder(orderBy);
    this.setLimit(limit);
    this.setCategory(category);

    console.log('get all courses');
    return new Promise<Course []>((resolve, reject) => {
      const sort = this.getOrder();
      let promise;
      if (this.category) {
        this.dbQuery = { category: this.category };
      }
      if (this.limit === 0) {
        promise = CourseDB.find(this.dbQuery).sort(sort);
      } else {
        promise = CourseDB.find(this.dbQuery).sort(sort).limit(this.limit);
      }
      console.log('in promise');
      promise.then(
        (all_courses) => {
          console.log(all_courses);
          resolve(all_courses);
        }).catch((error) => {
        reject(new ErrorResponse(false, error));
      });
    });
  }

  // Must place this before get by id
  @Get('search')
  public async search(@Query() query: string): Promise<Course []> {
    return new Promise<Course []> ((resolve, reject) => {
      const queryStr = query;
      // console.log('search ' + queryStr);
      if (queryStr) {
        const promise = CourseDB.find({$text: {$search: queryStr}});
        promise.then(
          searched_courses => resolve(searched_courses)).catch(
          err => resolve([]));
      } else {
        resolve([]);
      }
    });
  }

  @Get('{id}')
  public async getCourse(@Path() id: string): Promise<Course> {
    return new Promise<Course>((resolve, reject) => {
      const promise = CourseDB.findOne({_id: id});
      promise.then(
        acourse => resolve(acourse)).catch(
        error => reject(new ErrorResponse(false, 'Couldn\'t find the courses.'))
      );
    });
  }

  @Get('{youtubeRef}/youtubeinfo')
  public async getYoutubeInfo(youtubeRef: string): Promise<Course> {
    return new Promise<Course>((resolve, reject) => {
      const youTube = new YouTube();
      youTube.setKey(process.env.YOUTUBE_KEY);
      youTube.getById(youtubeRef, (error, info) => {
        if (error) {
          reject(new ErrorResponse(false, error));
        } else {
          const item = info.items[0];
          console.log(item);
          if (!item) {
            reject(new ErrorResponse(false, 'Cannot retreive the youtube info.'));
          } else {
            const promise = this.getFindAndUpdateYoutubePromise(youtubeRef, item);
            promise.then(
              (updated_course) => {
                resolve(updated_course);
          }).catch(err => reject(new ErrorResponse(false, err))); }
        }
      });
    });
  }

  public async getYoutubeInfo_not_saving(youtubeRef: string): Promise<YoutubeInfo> {
    return new Promise<YoutubeInfo>((resolve, reject) => {
      const youTube = new YouTube();
      youTube.setKey(process.env.YOUTUBE_KEY);
      youTube.getById(youtubeRef, (error, info) => {
        if (error) {
          reject(new ErrorResponse(false, error));
        } else {
          const item = info.items[0];
          if (item) {
            resolve(
              new YoutubeInfo( item.contentDetails.duration,
                              +item.statistics.likeCount,
                              +item.statistics.dislikeCount,
                              +item.statistics.viewCount,
                              +item.statistics.favoriteCount,
                              +item.statistics.commentCount,
                              item.snippet.publishedAt)
            );
          } else  {
            reject(new ErrorResponse(false, 'There\'s no youtube video found'));
          }
        }
      });
    });
  }

  @Security('JWT')
  @Post()
  public async addCourse(@Body() requestBody: UserCourseRequest, @Header('x-access-token') authorization: string): Promise<UserCourseResponse> {
    return new Promise<UserCourseResponse>((resolve, reject) => {
      const course = new CourseDB();
      Object.assign(course, requestBody);
      this.getYoutubeInfo_not_saving(course.youtube_ref).then(
        (youtube_info: YoutubeInfo) => {
          if (!youtube_info) {
            reject(new ErrorResponse(false, 'The youtube reference does not exist.'));
          }
          course.publishedDate = youtube_info.publishedDate;
          course.commentCount = youtube_info.commentCount;
          course.duration = youtube_info.duration;
          course.favoriteCount = youtube_info.favoriteCount;
          course.dislike = youtube_info.dislike;
          course.like = youtube_info.like;
          course.watched = youtube_info.watched;
          course.save(function (error) {
            if (error) {
              reject(new ErrorResponse(false, error));
            } else { resolve(new UserCourseResponse(true, 'Create a course successfully', course)); }
          });
        }
      ).catch(error1 => reject(new ErrorResponse(false, 'The youtube reference does not exist.')));
    });
  }

  @Security('JWT')
  @Put()
  public async updateCourse(@Body() requestBody: UserCourseRequest): Promise<UserCourseResponse> {
    const course = new Course();
    Object.assign(course, requestBody);
    return new Promise<UserCourseResponse>((resolve, reject) => {
      this.getYoutubeInfo_not_saving(course.youtube_ref).then(
        (youtube_info: YoutubeInfo) => {
          if (!youtube_info) { reject(new ErrorResponse(false, 'The youtube reference does not exist.')); }
          const course_promise = this.getFindAndUpdatePromise(course, youtube_info);
          course_promise.then((updated_course) => resolve(new UserCourseResponse(true, 'Updated a course successfully', updated_course))).catch(
            (error) => reject(new ErrorResponse(false, 'Updated course failed.')));
        }
      ).catch((error1) => reject(new ErrorResponse(false, 'The youtube reference does not exist.')));
    });
  }

  @Security('JWT')
  @Delete('{id}')
    public async deleteCourse(@Path() id: String): Promise<UserCourseResponse> {
      // console.log('Delete a course id');
      return new Promise<UserCourseResponse>((resolve, reject) => {
        const promise = CourseDB.findOneAndRemove({ _id: id});

        promise.then(
          (course) => {
            resolve(new UserCourseResponse(true, 'Successfully deleted a course', course));
          },
          (error) => {
            resolve(new UserCourseResponse(true, error, null));
          }
        );
      });
  }

  private getFindAndUpdateYoutubePromise(youtubeRef: string, item: any): Promise<Course> {
    return CourseDB.findOneAndUpdate(
      { youtube_ref: youtubeRef },
      { $set: {
          duration: item.contentDetails.duration,
          like: item.statistics.likeCount,
          dislike: item.statistics.dislikeCount,
          watched: item.statistics.viewCount,
          favoriteCount: item.statistics.favoriteCount,
          commentCount: item.statistics.commentCount,
          publishedDate: item.snippet.publishedAt
        }
      },
      { new: true});
  }

  private getFindAndUpdatePromise(course: Course, youtube_info: YoutubeInfo): Promise<Course> {
    return CourseDB.findOneAndUpdate({_id: course._id}, {$set: {
      title: course.title,
      code_name: course.code_name,
      keywords: course.keywords,
      desc: course.desc,
      youtube_ref: course.youtube_ref,
      category: course.category,
      publishedDate: youtube_info.publishedDate,
      commentCount: +youtube_info.commentCount,
      duration: youtube_info.duration,
      favoriteCount: +youtube_info.favoriteCount,
      dislike: +youtube_info.dislike,
      like: +youtube_info.like,
      watched: +youtube_info.watched
    }}, { new: true});
  }

  private getOrder(): string {
    let sort: string;
    this.desc === true ? sort = '-' + this.orderBy : sort = this.orderBy;
    return sort;
  }

  private setLimit(limit) {
    if (limit) {
      this.limit = limit;
    }
  }

  private setCategory(category) {
    if (category) {
      this.category = category;
    }
  }

  private setOrder(orderBy: string) {
    if (orderBy && orderBy.split(':')[0]) {
      this.orderBy = orderBy.split(':')[0];
      if (orderBy.split(':')[1] && orderBy.split(':')[1] === 'desc') {
        this.desc = true;
      } else {
        this.desc = false;
      }
    }
  }
}
