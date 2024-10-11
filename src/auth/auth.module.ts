import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import {Otp, OtpSchema} from "../models/otp.model";

@Module({
  imports: [
      UserModule,
      MongooseModule.forFeature([{name: Otp.name, schema: OtpSchema}]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
