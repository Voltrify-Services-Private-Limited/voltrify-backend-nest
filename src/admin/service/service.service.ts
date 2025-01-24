import {Injectable} from '@nestjs/common';
import {Request} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Service} from "../../models/service.model";
import {Model} from "mongoose";
import { ServiceType } from 'src/utils/types/service-type.enum';

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel(Service.name) private ServiceModel: Model<Service>
    ) {}

    private aggregateServiceData(condition?: string, filters?: any) {
        const pipeline: any[] = [];
        if (condition) {
            pipeline.push({
                $match: {
                    $or: [
                        { device_id: condition },
                        { name: condition },
                        { id: condition },
                        { city: condition },
                        { type: condition },
                        { category_id: condition } 
                    ]
                }
            });
        }

        if (filters) {
            pipeline.push({
                $match: filters
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
                    description: 1,
                    city: 1,
                    type: 1,            
                    duration: 1,
                    categoryId: '$category_id'          
                },
            }
        );

        return this.ServiceModel.aggregate(pipeline).exec();
    }

    async create(req: Request) {
        const { deviceId, name, description, visitingCharge, price, city, type ,duration,categoryId} = req.body;

        if (!deviceId || !name || !visitingCharge || !price || !city || !type || !categoryId) {
            return errorResponse(400, "All required fields (deviceId, name, visitingCharge, price, city, type,categoryId) must be provided");
        }

        if (!Object.values(ServiceType).includes(type)) {
            return errorResponse(400, `'${type}' is not a valid type.`);
        }

        const newService = new this.ServiceModel({
            device_id: deviceId,
            category_id:categoryId,
            name: name,
            description: description,
            price: price,
            visiting_charge: visitingCharge,
            city: Array.isArray(city) ? city : [city],
            type: type,
            duration: duration
        });

        await newService.save(); 
        return successResponse(201, "Service added");
    }

    async findAll(req: Request) {
        const services = await this.aggregateServiceData(); 
        return successResponse(200, "Devices data", services);
    }

    async findOne(req: Request) {
        const condition: string = req.params.condition;
        const { city, servicename,type,categoryId} = req.query;
        const filters: any = {};
        if (city) filters.city = city;
        if (servicename) filters.name = servicename;
        if (type) filters.type = type;
        if (categoryId) filters.category_id = categoryId;  

        const service = await this.aggregateServiceData(condition, filters);
        if (!service || service.length === 0) {
            return errorResponse(404, "No matching service found");
        }
        return successResponse(200, "Device data", service);
    }

    async update(req: Request) {
        const { deviceId, name, description, visitingCharge, price, city, type,duration,categoryId } = req.body;
        const id = req.params.id;

        const service = await this.ServiceModel.findOne({ id: id });
        if (!service) {
            return errorResponse(404, `Service id ${id} not found`);
        }

        service.device_id = deviceId || service.device_id;
        service.name = name || service.name;
        service.description = description || service.description;
        service.price = price || service.price;
        service.visiting_charge = visitingCharge || service.visiting_charge;
        service.city = city || service.city;
        service.type = type || service.type;
        service.duration = duration || service.duration;
        service.category_id = categoryId || service.category_id;

        await service.save();
        return successResponse(200, "Service updated")
    }

    async remove(req: Request) {
        const {id} = req.params;
        await this.ServiceModel.findOneAndDelete({id: id})
        return successResponse(200, "Service removed");
    }
}
