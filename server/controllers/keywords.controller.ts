import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete } from 'tsoa-nc';
import { KeywordModel } from '../models/keyword.model';
import KeywordDB from '../models/schemas/keywords';

@Route('keywords')
export class KeywordsController extends Controller {
  @Get('')
  public async all(@Query() limit?: number): Promise<KeywordModel []> {
    return new Promise<KeywordModel []>((resolve, reject) => {
      KeywordDB.find({}).then(
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