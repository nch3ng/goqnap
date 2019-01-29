import LogDB from './schemas/logs.schema';

export default class Log {
  _id: string;
  message: string;
  createdAt: number;
  userId?: string;
  action?: string;

  constructor(
    message: string,
    userId?: string,
    action?: string  
  ) {
    this.message = message;
    this.createdAt = Date.now();
    this.userId = userId;
    this.action = action;
  }

  save = () => {
  }

  static create({message, userId, action}) {
    return new Promise((resolve, reject) => {
      let log = {} as Log;
      log.message = message;
      log.createdAt = Date.now();

      if (userId) 
        log.userId = userId

      if (action)
        log.action = action

      LogDB.create(log, (err, log) => {
        if (err) return reject("Somoething went wronog");

        return resolve("Created a log");
      })
    });
  }

  static all() {
    return new Promise((resolve, reject) => {
      LogDB.find({}, (err, log) => {
        if (err) return reject("Somoething went wronog");

        return resolve("Created a log");
      });
    });
  }
}