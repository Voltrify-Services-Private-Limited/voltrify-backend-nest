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
    private async aggregateDeviceData(conditionId?: string) {
        const pipeline: any[] = [];
    
        if (conditionId) {
            pipeline.push({
                $match: {
                    $or: [
                        { device_id: conditionId },
                        { id: conditionId }
                    ]
                }
            });
        }
        pipeline.push(
            {
                $lookup: {
                    from: 'devices',
                    localField: 'device_id',
                    foreignField: 'id',
                    as: 'deviceDetails',
                },
            },
            {
                $unwind: {
                    path: '$deviceDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$device_id',
                    deviceId: { $first: '$device_id' },
                    deviceName: { $first: '$deviceDetails.name' },
                    conditions: { $push: { id: '$id', condition: '$condition' } },
                },
            },
            {
                $project: {
                    _id: 0,
                    deviceId: 1,
                    deviceName: 1,
                    conditions: 1,
                },
            }
        );
        return this.DeviceConditionModel.aggregate(pipeline).exec();
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
        const conditions = await this.aggregateDeviceData();
        return successResponse(200, "All conditions of devices", conditions)
    }

    async findOne(req: Request) {
        const conditionId: string = req.params.id;
        const condition = await this.aggregateDeviceData(conditionId);
        if (!condition || condition.length === 0) {
            return errorResponse(404, "Device condition not found");
        }
        return successResponse(200, "Device condition", condition[0])
    }

    async update(req: any) {
        const {deviceId, condition, id} = req.body;

        const deviceCondition: any = await this.DeviceConditionModel.findOne({ id: id })
        deviceCondition.device_id = deviceId || deviceCondition.device_id
        deviceCondition.condition = condition || deviceCondition.condition

        await deviceCondition.save();
        return successResponse(200, "Device condition updated")
    }

    async remove(req: Request) {
        const {id} = req.params;
        await this.DeviceConditionModel.findOneAndDelete({id: id})
        return successResponse(200, "Device condition removed");
    }
}
