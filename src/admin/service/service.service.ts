import {Injectable} from '@nestjs/common';
import {Request} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Service} from "../../models/service.model";
import {Model} from "mongoose";

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel(Service.name) private ServiceModel: Model<Service>
    ) {
    }
    private async aggregateServiceData(condition?: string) {
        const pipeline: any[] = [];

        if (condition) {
            pipeline.push({
                $match: {
                    $or: [
                        { device_id: condition },
                        { name: condition },
                        { id: condition }
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
                $project: {
                    _id: 0,
                    name: 1,
                    deviceId: '$device_id',
                    deviceName: '$deviceDetails.name',
                    price: 1,
                    visitingCharge: '$visiting_charge',
                    description: 1, // Include additional fields as needed
                },
            }
        );
        return this.ServiceModel.aggregate(pipeline).exec();
    }
    async create(req: Request) {
        const {deviceId, name, description, visitingCharge, price} = req.body;
        const deviceCondition = new this.ServiceModel({
            device_id: deviceId,
            name: name,
            description: description,
            price: price,
            visiting_charge: visitingCharge
        })
        await deviceCondition.save();
        return successResponse(201, "Service added");
    }

    async findAll(req: Request) {
        const services:any = await this.aggregateServiceData();
        return successResponse(200, "Devices data", services);
    }

    async findOne(req: Request) {
        const serviceId:string = req.params.id;
        const service:any = await this.aggregateServiceData(serviceId);
        return successResponse(200, "Device data", service);
    }

    async update(req: Request) {
        const {deviceId, name, description, visitingCharge, price, id} = req.body;

        const service: any = await this.ServiceModel.findOne({ id: id })
        if(!service) {
            return errorResponse(404, `Service id ${id} not found`);
        }
        service.device_id = deviceId || service.device_id
        service.name = name || service.name
        service.description = description || service.description
        service.price = price || service.price
        service.visiting_charge = visitingCharge || service.visiting_charge

        await service.save();
        return successResponse(200, "Service updated")
    }

    async remove(req: Request) {
        const {id} = req.params;
        await this.ServiceModel.findOneAndDelete({id: id})
        return successResponse(200, "Service removed");
    }
}
