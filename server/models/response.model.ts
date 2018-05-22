export interface GeneralResponse {
  success: boolean;
  message: string;
}

export class ErrorResponse implements GeneralResponse {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}
