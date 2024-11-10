import {Injectable} from '@nestjs/common';
import {Request, Response} from "express";
import {successResponse} from "../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Admin} from "../models/admin.model";
import {Model} from "mongoose";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Admin.name) private AdminModel: Model<Admin>
    ) {}


}
