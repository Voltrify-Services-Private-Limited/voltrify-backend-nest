import {Body, Controller, Post, Res} from '@nestjs/common';
import {OtpService} from './otp.service';
import {successResponse} from "../utils/response.util";
import {Response} from "express";

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {
    }

    @Post('generate-otp')
    async sendOtp(@Body() req: any, @Res() res: Response) {
        const result = await this.otpService.generateAndSendOtp(req)
        return res.status(result.statusCode).json(result)
    }
}
