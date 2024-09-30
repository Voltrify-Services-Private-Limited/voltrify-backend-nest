import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; status: number } {
    return {
      "status": 200,
      "message": "Service is running successfully"
    };
  }
}
