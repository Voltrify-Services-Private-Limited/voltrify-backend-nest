import { Injectable } from '@nestjs/common';
import {errorResponse, successResponse} from "../utils/response.util";
import {Model} from "mongoose";
import {User} from "../models/user.model";
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) {
    }
    async get(req: any){
        const userId = req.user.id
        const user = await this.userModel.findOne({id: userId})
        return successResponse(200, 'User data', user)
    }
    async update(req: any){
        const userId = req.user.id
        if(userId != req.body.id) {
            return errorResponse(403, 'Not authorised')
        }
        const user = await this.userModel.findOne({id: userId})
        if(!user){
            return errorResponse(404, 'User not found')
        }
        user.firstName = req.body.firstName
        user.lastName = req.body.lastName
        user.email = req.body.email
        await user.save()
        return successResponse(200, 'Data updated')
    }
}
