import { Route, Get, Query, Controller, Body, Post, Header, Security, Path, Put, Delete } from 'tsoa';
import { KeywordModel } from '../models/keyword.model';
import KeywordDB from '../models/schemas/keywords';

@Route('info')
export class InfoController extends Controller {
  
}