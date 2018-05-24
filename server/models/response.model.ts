import { UserCreationResponse } from './user.model';
export interface GeneralResponse {
  success: boolean;
  message: string;
}

export class ErrorResponse extends UserCreationResponse {
}
