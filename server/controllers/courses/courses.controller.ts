import { GeneralResponse } from './../../models/response.model';
import { Course } from './../../models/course.model';
import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete, Request } from 'tsoa';
import { UserCourseRequest, YoutubeInfo } from '../../models/course.model';
import CourseDB from '../../models/schemas/courses.schema';
// import { YouTube } from 'youtube-node';
import { ErrorResponse, UserCourseResponse } from '../../models/response.model';
import KeywordDB from '../../models/schemas/keywords';
import CourseClickDB from '../../models/schemas/course.click.schema';
import * as moment from 'moment';
import * as nodeExcel from 'excel-export';
import * as ResCode from '../../codes/response';
import * as express from 'express';

// import UserDB from '../../models/schemas/users.schema';

const YouTube = require('youtube-node');
// const propertyOf = <TObj>(name: keyof TObj) => name;

@Route('courses')
export class CoursesController extends Controller {
  desc = true;
  orderBy = 'publishedDate';
  limit = 0;
  category = null;
  dbQuery = {};
  page = 1;

  @Get()
  public async getCourses(@Query() limit?: number, @Query() orderBy?: string, @Query() category?: string, @Query() page?: number): Promise<Course []> {

    this.setOrder(orderBy);
    this.setLimit(limit);
    this.setCategory(category);
    this.setPage(page);

    return new Promise<Course []>((resolve, reject) => {
      const sort = this.getOrder();
      let promise;
      if (this.category) {
        this.dbQuery = { category: this.category };
      }

      if (this.limit === 0) {
        promise = CourseDB.find(this.dbQuery).sort(sort);
      } else {
        promise = CourseDB.paginate(this.dbQuery, { sort: sort, page: this.page, limit: this.limit});
        // promise = CourseDB.find(this.dbQuery).sort(sort).limit(this.limit);
      }
      promise.then(
        (all_courses) => {
          resolve(all_courses);
        }).catch((error) => {
        reject(new ErrorResponse(false, error, ResCode.GENERAL_ERROR));
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
      // console.log(startDate);
      // console.log(endDate);
      const request = this.getClickPromise(startDate, endDate);
      const promise = CourseClickDB.aggregate(request);

      promise.then(
        (courseClicks) => {
          resolve(courseClicks);
        }
      ).catch((e) => {
        reject(new ErrorResponse(false, e, ResCode.GENERAL_ERROR));
      })
    });
  }
  @Security('JWT')
  @Get('export')
  public async exportExcel(){
    return new Promise<GeneralResponse>((resolve, reject) => {
      let conf;
      conf.cols = [{
        caption: 'Sl.',
        type: 'number',
        width: 3
      }];
      let arr = [];
      arr.push([1]);
      conf.rows = arr;

      const result = nodeExcel.execute(conf);
      resolve(result)
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
                reject(new ErrorResponse(false, err, ResCode.GENERAL_ERROR))
              }
              else {
                resolve(new GeneralResponse(true, 'Success', ResCode.GENERAL_SUCCESS))
              }
            });
          }
        }
      ).catch(
        (err) => {
          reject(new ErrorResponse(false, err, ResCode.GENERAL_ERROR))
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
        error => reject(new ErrorResponse(false, 'Couldn\'t find the course.', ResCode.GENERAL_ERROR))
      );
    });
  }

  @Get('s/{slug}')
  public async getCourseBySlug(@Path() slug: string): Promise<Course> {
    // console.log('get course by slug')
    return new Promise<Course>((resolve, reject) => {
      const promise = CourseDB.findOne({slug: slug});
      promise.then(
        course => resolve(course)).catch(
        error => reject(new ErrorResponse(false, 'Couldn\'t find the course.', ResCode.GENERAL_ERROR))
      );
    });
  }

  @Get('{youtubeRef}/youtubeinfo')
  public async getYoutubeInfo(youtubeRef: string): Promise<Course> {
    return new Promise<Course>((resolve, reject) => {
      const youTube = new YouTube();
      youTube.setKey(process.env.YOUTUBE_KEY);
      youTube.getById(youtubeRef, (error: Error, info) => {
        if (error) {
          reject(new ErrorResponse(false, error.message, ResCode.GENERAL_ERROR));
        } else {
          const item = info.items[0];
          // console.log(item);
          if (!item) {
            reject(new ErrorResponse(false, 'Cannot retreive the youtube info.', ResCode.GENERAL_ERROR));
          } else {
            const promise = this.getFindAndUpdateYoutubePromise(youtubeRef, item);
            promise.then(
              (updated_course) => {
                resolve(updated_course);
          }).catch(err => reject(new ErrorResponse(false, err, ResCode.GENERAL_ERROR))); }
        }
      });
    });
  }

  public async getYoutubeInfo_not_saving(youtubeRef: string): Promise<YoutubeInfo> {
    return new Promise<YoutubeInfo>((resolve, reject) => {
      const youTube = new YouTube();
      youTube.setKey(process.env.YOUTUBE_KEY);
      youTube.getById(youtubeRef, (error: Error, info) => {
        if (error) {
          reject(new ErrorResponse(false, error.message, ResCode.GENERAL_ERROR));
        } else {
          const item:any = info.items[0];
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
            reject(new ErrorResponse(false, 'There\'s no youtube video found', ResCode.GENERAL_ERROR));
          }
        }
      });
    });
  }

  @Security('JWT', ['9'])
  @Post()
  public addCourse(@Body() requestBody: UserCourseRequest, @Header('x-access-token') authorization: string): Promise<UserCourseResponse | ErrorResponse> {
    return new Promise<UserCourseResponse | ErrorResponse>((resolve, reject) => {
      const course = new CourseDB();
      Object.assign(course, requestBody);
      // console.log(course);
      const paramChecked = this.checkAddCourseParams(requestBody);
      if (paramChecked) {
        reject(new ErrorResponse(false, paramChecked + ' is required', ResCode.GENERAL_ERROR));
        return;
      }

      CourseDB.findOne({code_name: course.code_name}).then(
        (res_course) => {
          if (res_course) {
            reject(new ErrorResponse(false, 'Code name exists', ResCode.GENERAL_ERROR));
            return;
          }
        }
      );

      this.getYoutubeInfo_not_saving(course.youtube_ref).then(
        (youtube_info: YoutubeInfo) => {
          if (!youtube_info) {
            reject(new ErrorResponse(false, 'The youtube reference does not exist.', ResCode.GENERAL_ERROR));
            return;
          }
          const slugify = require('slugify');

          course.category = course.category.toLowerCase();
          course.publishedDate = youtube_info.publishedDate;
          course.commentCount = youtube_info.commentCount;
          course.duration = youtube_info.duration;
          course.favoriteCount = youtube_info.favoriteCount;
          course.dislike = youtube_info.dislike;
          course.like = youtube_info.like;
          course.watched = youtube_info.watched;
          course.slug = slugify(course.title, {
            replacement: '-',    // replace spaces with replacement
            remove: null,        // regex to remove characters
            lower: true          // result in lower case
          })

          course.save(function (error) {
            if (error) {
              reject(new ErrorResponse(false, error, ResCode.GENERAL_ERROR));
            } else { resolve(new UserCourseResponse(true, 'Create a course successfully', course)); }
          });
        }
      ).catch(error1 => reject(new ErrorResponse(false, 'The youtube reference does not exist.', ResCode.GENERAL_ERROR)));
    });
  }

  @Security('JWT', ['9'])
  @Put()
  public async updateCourse(@Body() requestBody: UserCourseRequest, @Header('x-access-token') authorization: string): Promise<UserCourseResponse> {
    const course = new Course();
    Object.assign(course, requestBody);
    const slugify = require('slugify');
    course.slug = slugify(course.title, {
      replacement: '-',    // replace spaces with replacement
      remove: null,        // regex to remove characters
      lower: true          // result in lower case
    })
    // console.log(course);
    return new Promise<UserCourseResponse>((resolve, reject) => {
      const paramChecked = this.checkAddCourseParams(requestBody);
      if (paramChecked) {
        reject(new ErrorResponse(false, paramChecked + ' is required', ResCode.GENERAL_ERROR));
      }
      if (!course._id) {
        reject(new ErrorResponse(false, 'Please specify a course id', ResCode.GENERAL_ERROR));
        return;
      }
      this.getYoutubeInfo_not_saving(course.youtube_ref).then(
        (youtube_info: YoutubeInfo) => {
          if (!youtube_info) { reject(new ErrorResponse(false, 'The youtube reference does not exist.', ResCode.GENERAL_ERROR)); }
          const course_promise = this.getFindAndUpdatePromise(course, youtube_info);
          course_promise.then((updated_course) => resolve(new UserCourseResponse(true, 'Updated a course successfully', updated_course))).catch(
            (error) => reject(new ErrorResponse(false, 'Updated course failed.', ResCode.GENERAL_ERROR)));
        }
      ).catch((error1) => reject(new ErrorResponse(false, 'The youtube reference does not exist.', ResCode.GENERAL_ERROR)));
    });
  }

  @Security('JWT')
  @Get('code_name/{cid}')
  public async getCodenameByCourseId(@Path() cid, @Request() req: express.Request): Promise<GeneralResponse> {
    return new Promise<GeneralResponse> ((resolve, reject) => {
      CourseDB.findOne({_id: cid}).select('code_name slug').then((course) => {
        return resolve(new GeneralResponse(true, "got course", ResCode.GENERAL_SUCCESS, course));
      }).catch(
        err => {});
    })
  }

  @Security('JWT', ['9'])
  @Delete('{id}')
    public async deleteCourse(@Path() id: String, @Header('x-access-token') authorization: string): Promise<UserCourseResponse> {
      // console.log('Delete a course id');
      return new Promise<UserCourseResponse>((resolve, reject) => {
        if (!id) {
          reject(new ErrorResponse(false, 'Please specify a course id', ResCode.GENERAL_ERROR));
          return;
        }
        const promise = CourseDB.findOneAndRemove({ _id: id});

        promise.then(
          (course) => {
            resolve(new UserCourseResponse(true, 'Successfully deleted a course', course));
          },
          (error) => {
            reject(new ErrorResponse(false, 'Failed to delete a course', ResCode.GENERAL_ERROR));
          }
        );
      });
  }

  @Security('JWT', ['10'])
  @Post('create-slugs') 
  public async createSlugs(@Header('x-access-token') authorization: string): Promise<GeneralResponse> {
    const slugify = require('slugify');
    return new Promise<GeneralResponse>((resolve, reject) => {
      CourseDB.find({}, (err, courses: any) => {
        if(err) return reject(new GeneralResponse(false, 'Failed', ResCode.GENERAL_ERROR))

        courses.map((course) => {
          const slug = slugify(course.title, {
            replacement: '-',    // replace spaces with replacement
            remove: null,        // regex to remove characters
            lower: true          // result in lower case
          });
          course.slug = slug;
          course.save().then();
        })
      })
      resolve(new GeneralResponse(true, 'Done', ResCode.GENERAL_SUCCESS));
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
      slug: course.slug,
      youtube_ref: course.youtube_ref,
      category: course.category,
      publishedDate: youtube_info.publishedDate,
      commentCount: +youtube_info.commentCount,
      duration: youtube_info.duration,
      favoriteCount: +youtube_info.favoriteCount,
      dislike: +youtube_info.dislike,
      like: +youtube_info.like,
      watched: +youtube_info.watched,
      slide_link: course.slide_link
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

  private setPage(page: number) {
    if (page) {
      this.page = page;
    } else {
      this.page = 1;
    }
  }

  private recordKeyword(keyword) {
    KeywordDB.findOne({text: keyword}).then(
      (key) => {
        if (key) {
          // console.log('found it');
          key.times = key.times + 1;
        }
        else {
          // console.log('not found it');
          key = new KeywordDB({text: keyword, times: 1});
        }

        key.save((err) => {
          if (err) return console.log(err);

          // console.log('saved');
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
      { prop: 'youtube_ref', text: 'youtube reference'},
    ];
    for (const prop of properties) {
      if (!requestBody[prop.prop]) {
        return_str = prop.text;
      }
    }

    return return_str;
  }
}
