
import { Post, Body, Route, Get, Path, Delete, Security, Controller, Query, Put } from 'tsoa';
import Role from '../../models/role.model';
import RoleDB from '../../models/schemas/roles.schema';

import * as ResponseCode from '../../codes/response';
import { ErrorResponse, GeneralResponse } from '../../models/response.model';
import { reject } from 'q';

@Route('roles')
export class RolesController extends Controller {

  @Security('JWT', ['super admin', 'admin'])
  @Get()
  public async all(): Promise<Role []> {
    return new Promise<Role []>((resolve, reject) => {
      const promise = RoleDB.find({});
      promise.then((roles: Role []) => {
        if (roles) {
          return resolve(roles);
        } else {
          return resolve([]);
        }
      }).catch( (e) => {
        return resolve([]);
      });
    });
  }
}

@Route('role')
export class RoleController extends Controller {
  @Security('JWT', ['super admin'])
  @Post()
  public async create(@Body() requestBody: any): Promise<any> {
    console.log("Create role: ", requestBody)
    if(!requestBody.name) {
      return reject(new ErrorResponse(false, 'Please specify role name', ResponseCode.GENERAL_ERROR));
    }
    return new Promise<any>((resolve, reject) => {
      RoleDB.findOne({name: requestBody.name}, (error, role) => {
        if (error) {
          return reject(new ErrorResponse(false, error, ResponseCode.GENERAL_ERROR));
        }

        if (role) {
          return reject(new ErrorResponse(false, 'This role already exists', ResponseCode.GENERAL_ERROR));
        }

        RoleDB.create({ name: requestBody.name, level: requestBody.level, desc: requestBody.name.desc }, (err, role) => {
          if (err) {
            return reject(new ErrorResponse(false, error, ResponseCode.GENERAL_ERROR));
          }

          return resolve(new GeneralResponse(true, `Role ${role} has been created.`, ResponseCode.GENERAL_SUCCESS, role))
        })
      });
    });
  }

  @Security('JWT')
  @Get('{name}')
  public async get(@Path() name: string): Promise<any> {
    return new Promise<any> ((resolve, reject) => {
      resolve(0);
    });
  }

  @Security('JWT', ['super admin'])
  @Delete('{name}')
  public async delete(@Path() name: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(0);
    });
  }

  @Security('JWT', ['super admin'])
  @Put('{name}')
  public async update(@Path() name: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(0);
    });
  }
}