import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from '../user/user.model';
import {generateOtp} from "../utils/common.util";

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = new this.userModel();
        newUser.firstName = userData.firstName
        newUser.lastName = userData.lastName
        newUser.phoneNumber = userData.phoneNumber
        newUser.email = userData.email
        return newUser.save();
    }

}