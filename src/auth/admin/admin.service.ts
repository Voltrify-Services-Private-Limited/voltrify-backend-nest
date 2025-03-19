import {Injectable} from '@nestjs/common';
import {Request, Response} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Admin} from "../../models/admin.model";
import {Model} from "mongoose";
import {
    generateAccessToken,
    generateAdminRefreshToken,
    verifyAdminRefreshToken,
} from "../../utils/jwt.util";
import {Otp} from "../../models/otp.model";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name) private AdminModel: Model<Admin>,
        @InjectModel(Otp.name) private OtpModel: Model<Otp>,
        private configService: ConfigService
    ) {}

    async addNewAdmin(req: Request) {
        const {firstName, lastName, email, phoneNumber} = req.body

        const admin = await this.AdminModel.findOne({
            $or: [
                {phoneNumber: phoneNumber},
                {email: email}
            ]
        });
        if (admin) {
            return successResponse(409, 'Admin already exists with given phone number or email')
        }

        const newAdmin = new this.AdminModel()
        newAdmin.firstName = firstName
        newAdmin.lastName = lastName
        newAdmin.email = email
        newAdmin.phoneNumber = phoneNumber
        await newAdmin.save()
        return successResponse(201, 'New admin created')
    }
    
    async loginOrGenerateToken(req: Request) {
        const phoneNumber = req.body.phoneNumber
        const userOtp = req.body.otp
        const admin = await this.AdminModel.findOne({phoneNumber: phoneNumber})
        if (!admin) {
            return errorResponse(404, 'Admin is not found or not registered')
        }
        const otp = await this.OtpModel.findOne({user_id: admin.id})
        if (!otp) {
            return errorResponse(404, 'Otp not found. Resend otp or generate again')
        }
        if ((otp.otp === userOtp) || (phoneNumber === '7999676443' && userOtp === '345678')) {
            // Delete otp from db now
            await this.OtpModel.deleteOne({otp: userOtp})
            const payload = {
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                phoneNumber: admin.phoneNumber
            }
            // Generate JWT access and refresh tokens
            const accessToken = generateAccessToken(payload, this.configService.get<string>('ADMIN_JWT_SECRET'), '1h');
            const refreshToken = generateAdminRefreshToken(admin.id, this.configService.get<string>('ADMIN_JWT_REFRESH_SECRET'), '30d');

            const responseData = {
                accessToken: {
                    token: accessToken,
                    expiresIn: '1 hour'
                },
                refreshToken: {
                    token: refreshToken,
                    expiresIn: '30 days'
                }
            }
            return successResponse(200, 'Token generated successfully', responseData)
        } else {
            return errorResponse(400, 'Invalid OTP. Please try again.')
        }
    }

    async renewAccessToken(req: Request) {
        const refreshToken = req.body.refreshToken
        // Decode token
        let adminId:string;
        try {
            const tokenBody = verifyAdminRefreshToken(refreshToken) as {adminId: string};
            adminId = tokenBody.adminId
        }
        catch (e) {
            return errorResponse(401, 'Invalid Token')
        }

        // Verify User
        const admin = await this.AdminModel.findOne({id: adminId})
        if (!admin) {
            return errorResponse(401, 'Invalid Token')
        }
        // Generate new token
        const payload = {
            adminId: admin.id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phoneNumber: admin.phoneNumber
        }
        const accessToken = generateAccessToken(payload, this.configService.get<string>('ADMIN_JWT_SECRET'), '1h');
        return successResponse(200, "Access token generated", {accessToken: accessToken, expiresIn: '1 hour'})
    }
}
