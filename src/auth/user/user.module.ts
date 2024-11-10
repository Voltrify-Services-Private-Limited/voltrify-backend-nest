import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Otp, OtpSchema} from "../../models/otp.model";
import {User, UserSchema} from "../../models/user.model";

@Module({
  imports: [
      MongooseModule.forFeature([{name: Otp.name, schema: OtpSchema}]),
      MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
