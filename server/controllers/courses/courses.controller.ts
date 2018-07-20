import { GeneralResponse } from './../../models/response.model';
import { Course } from './../../models/course.model';
import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete } from 'tsoa-nc';
import { UserCourseRequest, YoutubeInfo } from '../../models/course.model';
import CourseDB from '../../models/schemas/courses.schema';
import * as YouTube from 'youtube-node';
import { ErrorResponse, UserCourseResponse } from '../../models/response.model';
import KeywordDB from '../../models/schemas/keywords';
import CourseClickDB from '../../models/schemas/course.click.schema';
import * as moment from 'moment';

const propertyOf = <TObj>(name: keyof TObj) => name;

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
      promise.then(
        (all_courses) => {
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
        this.recordKeyword(queryStr);
        const promise = CourseDB.find({$text: {$search: queryStr}});
        promise.then(
          searched_courses => resolve(searched_courses)).catch(
          err => {
            // console.error(err);
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }

  private isDateValid(dateStr) {
    return moment(dateStr).isValid();
  }

  private getClickPromise(startDate, endDate) {
    let request = [];
    let i = 0;
    if (!this.isDateValid(startDate)) {
      startDate = null;
    }
    if (!this.isDateValid(endDate)) {
      endDate = null;
    }
    if (startDate || endDate) {
      request[i] = { 
        $match: {
          clickedAt: {
            
          }
        }
      }
      if (startDate) {
        const sD = new Date(startDate);
        sD.setHours(0,0,0,0);
        request[i]['$match']['clickedAt']['$gte'] = new Date(sD);
      }
      if (endDate) {
        const eD = new Date(endDate);
        eD.setHours(23,59,59,999);
        request[i]['$match']['clickedAt']['$lte'] = new Date(eD);
      }
      i += 1;
    }

    request[i] = {
      $group: {
        '_id' : "$course_id",
        'count': { $sum: 1 }
      }
    }
    i += 1;
    request[i] = {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courses"
      }
    }
    i += 1;
    request[i] = {
      $sort: {
        count: -1
      }
    }
    // console.log(request[0]);
    // console.log(request);
    return request;
  }
  @Security('JWT')
  @Get('clickStatus')
  public async clickStatus(@Query() startDate?: string, @Query() endDate?:string) {
    return new Promise<GeneralResponse>((resolve, reject) => {
      const last7days = new Date().getTime() - 7 * 60 * 60 * 24 * 1000;
      const last30days = new Date().getTime() - 30 * 60 * 60 * 24 * 1000;
      console.log(startDate);
      console.log(endDate);
      const request = this.getClickPromise(startDate, endDate);
      const promise = CourseClickDB.aggregate(request);

      promise.then(
        (courseClicks) => {
          resolve(courseClicks);
        }
      ).catch((e) => {
        reject(new ErrorResponse(false, e));
      })
    });
  }

  @Post('{id}/clicked')
  public async courseClicked(@Path() id: string): Promise<GeneralResponse> {
    return new Promise<GeneralResponse>((resolve, reject) => {
      this.getCourse(id).then(
        (course) => {
          if (course) {
            const courseClick = new CourseClickDB({ course_id: id, code_name: course.code_name});
            courseClick.save((err) => {
              if (err) {
                reject(new ErrorResponse(false, err))
              }
              else {
                resolve(new GeneralResponse(true, 'Success'))
              }
            });
          }
        }
      ).catch(
        (err) => {
          reject(new ErrorResponse(false, err))
        }
      );
    });
  }

  @Get('{id}')
  public async getCourse(@Path() id: string): Promise<Course> {
    return new Promise<Course>((resolve, reject) => {
      const promise = CourseDB.findOne({_id: id});
      promise.then(
        acourse => resolve(acourse)).catch(
        error => reject(new ErrorResponse(false, 'Couldn\'t find the course.'))
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
          // console.log(item);
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
  public addCourse(@Body() requestBody: UserCourseRequest, @Header('x-access-token') authorization: string): Promise<UserCourseResponse | ErrorResponse> {
    return new Promise<UserCourseResponse | ErrorResponse>((resolve, reject) => {
      const course = new CourseDB();
      Object.assign(course, requestBody);
      const paramChecked = this.checkAddCourseParams(requestBody);
      if (paramChecked) {
        reject(new ErrorResponse(false, paramChecked + ' is required'));
        return;
      }

      CourseDB.findOne({code_name: course.code_name}).then(
        (res_course) => {
          if (res_course) {
            reject(new ErrorResponse(false, 'Code name exists'));
            return;
          }
        }
      );

      this.getYoutubeInfo_not_saving(course.youtube_ref).then(
        (youtube_info: YoutubeInfo) => {
          if (!youtube_info) {
            reject(new ErrorResponse(false, 'The youtube reference does not exist.'));
            return;
          }
          course.category = course.category.toLowerCase();
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
  public async updateCourse(@Body() requestBody: UserCourseRequest, @Header('x-access-token') authorization: string): Promise<UserCourseResponse> {
    const course = new Course();
    Object.assign(course, requestBody);
    return new Promise<UserCourseResponse>((resolve, reject) => {
      const paramChecked = this.checkAddCourseParams(requestBody);
      if (paramChecked) {
        reject(new ErrorResponse(false, paramChecked + ' is required'));
      }
      if (!course._id) {
        reject(new ErrorResponse(false, 'Please specify a course id'));
        return;
      }
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
    public async deleteCourse(@Path() id: String, @Header('x-access-token') authorization: string): Promise<UserCourseResponse> {
      // console.log('Delete a course id');
      return new Promise<UserCourseResponse>((resolve, reject) => {
        if (!id) {
          reject(new ErrorResponse(false, 'Please specify a course id'));
          return;
        }
        const promise = CourseDB.findOneAndRemove({ _id: id});

        promise.then(
          (course) => {
            resolve(new UserCourseResponse(true, 'Successfully deleted a course', course));
          },
          (error) => {
            reject(new ErrorResponse(false, 'Failed to delete a course'));
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

  private recordKeyword(keyword) {
    KeywordDB.findOne({text: keyword}).then(
      (key) => {
        if (key) {
          console.log('found it');
          key.times = key.times + 1;
        }
        else {
          console.log('not found it');
          key = new KeywordDB({text: keyword, times: 1});
        }

        key.save((err) => {
          if (err) return console.log(err);

          console.log('saved');
          // saved!
        });
      }
    );
  }

  private checkAddCourseParams(requestBody: UserCourseRequest) {
    let return_str: string = null;
    // const properties = Object.getOwnPropertyNames(requestBody);
    const properties = [
      { prop: 'title', text: 'title'},
      { prop: 'code_name', text: 'code name'},
      { prop: 'desc', text: 'desc'},
      { prop: 'keywords', text: 'keywords'},
      { prop: 'category', text: 'category'},
      { prop: 'youtube_ref', text: 'youtube reference'}
    ];
    for (const prop of properties) {
      if (!requestBody[prop.prop]) {
        return_str = prop.text;
      }
    }
    // if (!requestBody.title) {
    //   return_str = 'title';
    // }

    // if (!requestBody.code_name) {
    //   return_str = 'code name';
    // }

    // if (!requestBody.desc) {
    //   return_str = 'desc';
    // }

    // if (!requestBody.keywords) {
    //   return_str = 'keywords';
    // }

    // if (!requestBody.category) {
    //   return_str = 'category';
    // }

    // if (!requestBody.youtube_ref) {
    //   return_str =  'youtube reference';
    // }

    return return_str;
  }
}
