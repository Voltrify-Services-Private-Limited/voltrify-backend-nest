import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Otp } from "../models/otp.model";
import {errorResponse, successResponse} from "../utils/response.util";
import { generateOtp } from "../utils/common.util";
import { NotificationService } from "../notification/notification.service";
import { User } from "../models/user.model";
import {optMessageBody} from "../utils/constant.util";
import {Admin} from "../models/admin.model";

@Injectable()
export class OtpService {
    constructor(
        @InjectModel(Otp.name) private otpModel: Model<Otp>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Admin.name) private AdminModel: Model<Admin>,
        private notificationService: NotificationService
    ) {}

    async generateAndSendOtp(req: any) {
        const phoneNumber = req.phone_number;
        const isAdmin = req.is_admin
        let userId = null

        if(isAdmin) {
            // Check if it is come for admin and if so then check in admin table
            const admin = await this.AdminModel.findOne({ phoneNumber: phoneNumber }).exec();
            if (!admin) {
                return successResponse(404, "Admin not found"); // Correct the message
            }
            userId = admin.id
        }
        else{
            // Check account in database using injected User model
            const user = await this.userModel.findOne({ phoneNumber: phoneNumber }).exec();
            if (!user) {
                return successResponse(404, "User not found"); // Correct the message
            }
            userId = user.id
        }

        // Delete already existing OTP for this user
        await this.otpModel.deleteOne({ user_id: userId }).exec();

        // Create new OTP for user
        const newOtp = new this.otpModel();
        const otp = generateOtp(6); // Generating a dynamic 6-digit OTP
        newOtp.user_id = userId;
        newOtp.otp = otp;
        await newOtp.save();

        // Send OTP via SMS using NotificationService
        const message = optMessageBody(otp);
        const sendMessage = await this.notificationService.sendSMS(phoneNumber, message);
        if (sendMessage.status !== 200){
            return errorResponse(500, "Something went wrong")
        }
        return successResponse(201, "Otp created")
    }
}
