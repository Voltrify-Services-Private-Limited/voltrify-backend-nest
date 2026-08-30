import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from '../../models/user.model';
import {errorResponse, successResponse} from "../../utils/response.util";
import {Request} from 'express';
import {Otp} from "../../models/otp.model";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from '../../utils/jwt.util';
import {verifyGoogleIdToken} from '../../utils/google.util';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Otp.name) private otpModel: Model<Otp>,
        private configService: ConfigService
    ) {
    }

    async create(userData: Partial<User>) {
        // Check Already user registered
        const phoneNumber = userData.phoneNumber
        const email = userData.email

        const user = await this.userModel.findOne({
            $or: [
                {phoneNumber: phoneNumber}
            ]
        });
        if (user) {
            return successResponse(409, 'Account already exists with given phone number or email')
        }
        const newUser = new this.userModel();
        newUser.firstName = userData.firstName
        newUser.lastName = userData.lastName
        newUser.phoneNumber = phoneNumber
        newUser.email = email
        await newUser.save()
        return successResponse(201, "User created")
    }

    async loginOrGenerateToken(req: Request) {
        const phoneNumber = req.body.phoneNumber
        const userOtp = req.body.otp
        const user = await this.userModel.findOne({phoneNumber: phoneNumber})
        if (!user) {
            return errorResponse(404, 'User is not found or not registered')
        }
        const otp = await this.otpModel.findOne({user_id: user.id})
        if (!otp) {
            return errorResponse(404, 'Otp not found. Resend otp or generate again')
        }
        if (otp.otp === userOtp) {
            // Delete otp from db now
            await this.otpModel.deleteOne({otp: userOtp})
            const payload = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
            // Generate JWT access and refresh tokens
            const accessToken = generateAccessToken(payload, this.configService.get<string>('JWT_SECRET'), '1h');
            const refreshToken = generateRefreshToken(user.id, this.configService.get<string>('JWT_REFRESH_SECRET'), '30d');

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

    async loginWithGoogle(req: Request) {
        const idToken = req.body.idToken || req.body.id_token;
        console.log("api is running:", idToken);
        if (!idToken) {
            return errorResponse(400, 'Google idToken is required');
        }

        // Verify token with Google
        let googlePayload;
        try {
            googlePayload = await verifyGoogleIdToken(idToken);
        } catch (e) {
            return errorResponse(401, 'Invalid or expired Google token');
        }

        const email = googlePayload.email;
        const googleId = googlePayload.sub;
        if (!email || !googleId) {
            return errorResponse(400, 'Google account did not provide a valid email');
        }

        // Find user by googleId first, then fall back to email (account linking)
        let user = await this.userModel.findOne({googleId});
        if (!user) {
            user = await this.userModel.findOne({email});
        }

        if (user) {
            // Link Google to an existing (e.g. phone-registered) account if needed
            let shouldSave = false;
            if (!user.googleId) {
                user.googleId = googleId;
                shouldSave = true;
            }
            if (!user.verified && googlePayload.email_verified) {
                user.verified = true;
                shouldSave = true;
            }
            if (!user.avatar && googlePayload.picture) {
                user.avatar = googlePayload.picture;
                shouldSave = true;
            }
            if (shouldSave) {
                await user.save();
            }
        } else {
            // Create a brand new Google user (no phone number required)
            user = new this.userModel();
            user.firstName = googlePayload.given_name || googlePayload.name || '';
            user.lastName = googlePayload.family_name || '';
            user.email = email;
            user.googleId = googleId;
            user.authProvider = 'google';
            user.avatar = googlePayload.picture;
            user.verified = !!googlePayload.email_verified;
            await user.save();
        }

        const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
        const accessToken = generateAccessToken(payload, this.configService.get<string>('JWT_SECRET'), '1h');
        const refreshToken = generateRefreshToken(user.id, this.configService.get<string>('JWT_REFRESH_SECRET'), '30d');

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
    }

    async renewAccessToken(req: Request) {
        const refreshToken = req.body.refreshToken
        // Decode token
        let userId:string;
        try {
            const tokenBody:any = verifyRefreshToken(refreshToken)
            userId = tokenBody.userId
        }
        catch (e) {
            return errorResponse(401, 'Invalid Token')
        }

        // Verify User
        const user = await this.userModel.findOne({id: userId})
        if (!user) {
            return errorResponse(401, 'Invalid Token')
        }
        // Generate new token
        const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
        const accessToken = generateAccessToken(payload, this.configService.get<string>('JWT_SECRET'), '1h');
        return successResponse(200, "Access token generated", {accessToken: accessToken, expiresIn: '1 hour'})
    }
}