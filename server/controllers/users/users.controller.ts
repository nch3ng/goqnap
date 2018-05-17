import { Post, Body, SuccessResponse } from 'tsoa';
import { UserCreationRequest } from '../../models/user.model';

export class UserController {

  @SuccessResponse(name)('201', 'Created') // Custom success response
  @Post()()
  async create(@Body()() requestBody: UserCreationRequest): Promise<void> {

  }
}
