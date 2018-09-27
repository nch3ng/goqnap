import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete } from 'tsoa';
import { KeywordModel } from '../models/keyword.model';
import KeywordDB from '../models/schemas/keywords';

@Security('JWT')
@Route('keywords')
export class KeywordsController extends Controller {

  limit = 0;
  @Get('')
  public async all(@Query() limit?: number): Promise<KeywordModel []> {
    return new Promise<KeywordModel []>((resolve, reject) => {
      let promise;
      if (limit) {
        this.limit = limit;
      }

      if (this.limit == 0) {
        promise = KeywordDB.find({}).sort('-times');
      } else {
        promise = KeywordDB.find({}).sort('-times').limit(limit);
      }

      promise.then(
        (keywords: KeywordModel []) => {
          if (!keywords) {
            resolve([]);
          }
          else {
            resolve(keywords);
          }
        }
      );
    })
  }
}