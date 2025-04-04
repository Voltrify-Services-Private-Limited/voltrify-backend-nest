import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Admin, AdminSchema} from "../../models/admin.model";
import {Otp, OtpSchema} from "../../models/otp.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Admin.name, schema: AdminSchema},
            {name: Otp.name, schema: OtpSchema}
        ])
    ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
