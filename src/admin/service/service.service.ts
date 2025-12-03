import {Injectable} from '@nestjs/common';
import {Request} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Service} from "../../models/service.model";
import {Model} from "mongoose";
import { ServiceType } from 'src/utils/types/service-type.enum';
import { S3Service } from '../../s3.service';

@Injectable()
export class ServiceService {
    constructor(
        @InjectModel(Service.name) private ServiceModel: Model<Service>,
        private readonly s3Service: S3Service
    ) {}

    private async aggregateServiceData(condition?: string, filters?: any, pageNo?: any, recordsPerPage?: any) {
        const pipeline: any[] = [];
        if (condition) {
            pipeline.push({
                $match: {
                    $or: [
                        { device_id: condition },
                        { id: condition },
                    ]
                }
            });
        }

        if (filters) {
            pipeline.push({
                $match: filters
            });
        }
        // Clone pipeline to use for total count
        const countPipeline = [...pipeline, { $count: "totalRecords" }];
        const totalCountResult = await this.ServiceModel.aggregate(countPipeline).exec();
        const totalRecords = totalCountResult.length > 0 ? totalCountResult[0].totalRecords : 0;

        // Sorting by createdAt in descending order (latest first)
        pipeline.push({
            $sort: { createdAt: -1 }
        });

        // Apply pagination only if both pageNo and totalRecords are provided
        if (pageNo !== undefined && recordsPerPage !== undefined) {
            const skip = (Number(pageNo) - 1) * Number(recordsPerPage);
            pipeline.push({ $skip: skip }, { $limit: Number(recordsPerPage) });
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
                    id: 1,
                    name: 1,
                    deviceId: '$device_id',
                    deviceName: '$deviceDetails.name',
                    deviceImage: '$deviceDetails.images',
                    price: 1,
                    description: 1,
                    city: 1,
                    type: 1,            
                    duration: 1,
                    priority: 1,
                    categoryId: '$category_id',
                    visitingCharge: '$visiting_charge',
                },
            }
        );

        const services = await this.ServiceModel.aggregate(pipeline).exec();

        return { totalRecords, services };
    }

    async create(req: Request) {
        const { deviceId, name, description, visitingCharge, price, city, type ,duration,categoryId, priority} = req.body;
        console.log(req.body);

        if (!deviceId || !name || !visitingCharge || !price || !city || !type ) {
            return errorResponse(400, "All required fields (deviceId, name, visitingCharge, price, city, type) must be provided");
        }

        if (!Object.values(ServiceType).includes(type)) {
            return errorResponse(400, `'${type}' is not a valid type.`);
        }

        const newService = new this.ServiceModel({
            device_id: deviceId,
            name: name,
            description: description,
            price: price,
            visiting_charge: visitingCharge,
            city: Array.isArray(city) ? city : [city],
            type: type,
            duration: duration,
            priority: priority ? priority : 1000,
        });

        await newService.save(); 
        return successResponse(201, "Service added");
    }

    async findAll(req: Request) {
        const pageNo: any = req.query.pageNo;
        const recordsPerPage: any = req.query.recordsPerPage;
        const { totalRecords, services } = await this.aggregateServiceData(undefined, undefined, pageNo, recordsPerPage);
        // Transform each device to include pre-signed URLs for images
        const updatedServices = await Promise.all(
            services.map(async (service) => {
                if (service.deviceImage){
                    service.deviceImage = await Promise.all(
                        service?.deviceImage?.map(async (image: any) => await this.s3Service.getPresignedUrl(image))
                    );
                }
                return service;
            })
        );
        return successResponse(200, "Devices data", updatedServices, totalRecords);
    }

    async findWithFilters(req: Request) {
        const condition: string = req.params.condition;
        const { city, serviceName, type, categoryId, recordsPerPage, pageNo}:any = req.query;
        const filters: any = {};
        if (city) filters.city = city;
        if (serviceName) filters.name = { $regex: new RegExp(serviceName, "i") }; // Case-insensitive search
        if (type) filters.type = type;
        if (categoryId) filters.category_id = categoryId;

        const { totalRecords, services } = await this.aggregateServiceData(condition, filters, pageNo, recordsPerPage);
        if (!services || services.length === 0) {
            return errorResponse(404, "No matching service found");
        }
        // Transform each device to include pre-signed URLs for images
        const updatedServices = await Promise.all(
            services.map(async (service) => {
                if (service.deviceImage){
                    service.deviceImage = await Promise.all(
                        service?.deviceImage?.map(async (image: any) => await this.s3Service.getPresignedUrl(image))
                    );
                }
                return service;
            })
        );
        return successResponse(200, "Device data", updatedServices, totalRecords);
    }

    async update(req: Request) {
        const { deviceId, name, description, visitingCharge, price, city, type,duration,categoryId, priority } = req.body;
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
        service.priority = priority ? priority : 1000;

        await service.save();
        return successResponse(200, "Service updated")
    }

    async remove(req: Request) {
        const {id} = req.params;
        await this.ServiceModel.findOneAndDelete({id: id})
        return successResponse(200, "Service removed");
    }
}
