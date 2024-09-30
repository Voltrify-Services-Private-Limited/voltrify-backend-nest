import {Body, Controller, Post} from '@nestjs/common';
import {OtpService} from './otp.service';
import {successResponse} from "../utils/response.util";

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {
    }

    @Post('generate-otp')
    async sendOtp(@Body() req: any) {
        return await this.otpService.generateAndSendOtp(req)
    }

}
