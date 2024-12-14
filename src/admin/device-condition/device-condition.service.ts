import {Injectable} from '@nestjs/common';
import {Request} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {DeviceCondition} from "../../models/device_condition.model";
import {Model} from "mongoose";

@Injectable()
export class DeviceConditionService {
    constructor(
        @InjectModel(DeviceCondition.name) private DeviceConditionModel: Model<DeviceCondition>
    ) {
    }

    async addNewCondition(req: Request) {
        const {deviceId, condition} = req.body;
        const deviceCondition = new this.DeviceConditionModel({
            device_id: deviceId,
            condition: condition,
        })
        await deviceCondition.save();
        return successResponse(201, "Device condition added")
    }

    async findAll(req: Request) {
        const conditions: any = await this.DeviceConditionModel.find()
        return successResponse(200, "All conditions of devices", conditions)
    }

    async findOne(req: Request) {
        const conditionId: string = req.params.id;
        const condition: any = await this.DeviceConditionModel.find({id: conditionId})
        return successResponse(200, "Device condition", condition)
    }

    async update(req: any) {
        const {deviceId, condition, id} = req.body;

        const deviceCondition: any = await this.DeviceConditionModel.findOne({id: id})
        condition.device_id = deviceId || condition.device_id
        condition.condition = condition || condition.condition

        await deviceCondition.save();
        return successResponse(201, "Device condition updated")
    }

    async remove(req: Request) {
        const {id} = req.params;
        await this.DeviceConditionModel.findOneAndDelete({id: id})
        return successResponse(200, "Device condition removed");
    }
}
