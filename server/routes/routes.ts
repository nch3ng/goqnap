/* tslint:disable */
import { Controller, ValidateParam, FieldErrors, ValidateError, TsoaRoute } from 'tsoa';
import { CoursesController } from './../controllers/courses/courses.controller';

const models: TsoaRoute.Models = {
  "Course": {
    "properties": {
      "_id": { "dataType": "string", "required": true },
      "title": { "dataType": "string", "required": true },
      "code_name": { "dataType": "string", "required": true },
      "desc": { "dataType": "string", "required": true },
      "keywords": { "dataType": "string", "required": true },
      "youtube_ref": { "dataType": "string", "required": true },
      "category": { "dataType": "string", "required": true },
      "watched": { "dataType": "double" },
      "rank": { "dataType": "double" },
      "createAt": { "dataType": "datetime" },
      "publishedDate": { "dataType": "datetime" },
      "like": { "dataType": "double" },
      "dislike": { "dataType": "double" },
      "favoriteCount": { "dataType": "double" },
      "duration": { "dataType": "string" },
      "commentCount": { "dataType": "double" },
    },
  },
  "UserCourseResponse": {
    "properties": {
      "success": { "dataType": "boolean", "required": true },
      "message": { "dataType": "string", "required": true },
      "course": { "ref": "Course", "required": true },
    },
  },
  "UserCourseRequest": {
    "properties": {
      "_id": { "dataType": "string" },
      "title": { "dataType": "string", "required": true },
      "code_name": { "dataType": "string", "required": true },
      "desc": { "dataType": "string", "required": true },
      "keywords": { "dataType": "string", "required": true },
      "youtube_ref": { "dataType": "string", "required": true },
      "category": { "dataType": "string", "required": true },
      "watched": { "dataType": "double" },
      "rank": { "dataType": "double" },
      "createAt": { "dataType": "datetime" },
      "publishedDate": { "dataType": "datetime" },
      "like": { "dataType": "double" },
      "dislike": { "dataType": "double" },
      "favoriteCount": { "dataType": "double" },
      "duration": { "dataType": "string" },
      "commentCount": { "dataType": "double" },
    },
  },
};

export function RegisterRoutes(app: any) {
  app.get('/courses',
    function(request: any, response: any, next: any) {
      const args = {
        limit: { "in": "query", "name": "limit", "dataType": "double" },
        orderBy: { "in": "query", "name": "orderBy", "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CoursesController();


      const promise = controller.getCourses.apply(controller, validatedArgs);
      promiseHandler(controller, promise, response, next);
    });
  app.get('/courses/:id',
    function(request: any, response: any, next: any) {
      const args = {
        id: { "in": "path", "name": "id", "required": true, "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CoursesController();


      const promise = controller.getCourse.apply(controller, validatedArgs);
      promiseHandler(controller, promise, response, next);
    });
  app.get('/courses/search',
    function(request: any, response: any, next: any) {
      const args = {
        query: { "in": "query", "name": "query", "required": true, "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CoursesController();


      const promise = controller.search.apply(controller, validatedArgs);
      promiseHandler(controller, promise, response, next);
    });
  app.get('/courses/:youtubeRef/youtubeinfo',
    function(request: any, response: any, next: any) {
      const args = {
        youtubeRef: { "in": "path", "name": "youtubeRef", "required": true, "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CoursesController();


      const promise = controller.getYoutubeInfo.apply(controller, validatedArgs);
      promiseHandler(controller, promise, response, next);
    });
  app.post('/courses',
    function(request: any, response: any, next: any) {
      const args = {
        requestBody: { "in": "body", "name": "requestBody", "required": true, "ref": "UserCourseRequest" },
        authorization: { "in": "header", "name": "Authorization", "required": true, "dataType": "string" },
      };

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request);
      } catch (err) {
        return next(err);
      }

      const controller = new CoursesController();


      const promise = controller.addCourse.apply(controller, validatedArgs);
      promiseHandler(controller, promise, response, next);
    });


  function promiseHandler(controllerObj: any, promise: any, response: any, next: any) {
    return Promise.resolve(promise)
      .then((data: any) => {
        let statusCode;
        if (controllerObj instanceof Controller) {
          const controller = controllerObj as Controller
          const headers = controller.getHeaders();
          Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
          });

          statusCode = controller.getStatus();
        }

        if (data) {
          response.status(statusCode || 200).json(data);
        } else {
          response.status(statusCode || 204).end();
        }
      })
      .catch((error: any) => next(error));
  }

  function getValidatedArgs(args: any, request: any): any[] {
    const fieldErrors: FieldErrors = {};
    const values = Object.keys(args).map((key) => {
      const name = args[key].name;
      switch (args[key].in) {
        case 'request':
          return request;
        case 'query':
          return ValidateParam(args[key], request.query[name], models, name, fieldErrors);
        case 'path':
          return ValidateParam(args[key], request.params[name], models, name, fieldErrors);
        case 'header':
          return ValidateParam(args[key], request.header(name), models, name, fieldErrors);
        case 'body':
          return ValidateParam(args[key], request.body, models, name, fieldErrors, name + '.');
        case 'body-prop':
          return ValidateParam(args[key], request.body[name], models, name, fieldErrors, 'body.');
      }
    });
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, '');
    }
    return values;
  }
}
