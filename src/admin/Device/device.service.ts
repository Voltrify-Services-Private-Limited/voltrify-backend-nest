import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Device } from '../../models/device.model';
import { S3Service } from '../../s3.service';

function getLookupPipeline(): PipelineStage[] {
    return [
        {
            $lookup: {
                from: 'categories',
                localField: 'categories_id',
                foreignField: 'id',
                as: 'categories_details',
            },
        },
        {
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                description: 1,
                images: 1,
                categories_id: 1,
                categories_details: { name: 1 },
            },
        },
    ];
}

@Injectable()
export class DeviceService {
    constructor(
        @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
        private readonly s3Service: S3Service
    ) {
    }

    async create(name: string, description: string, categories_id: any, images: any): Promise<Device> {
        // categories_id = JSON.parse(categories_id)
        categories_id = categories_id.split(',');
        const newDevice = new this.deviceModel({ name, description, categories_id, images });
        return newDevice.save();
    }

    async findAll(): Promise<Device[]> {
        const pipeline = getLookupPipeline();
        const devices: any[] = await this.deviceModel.aggregate(pipeline).exec();

        // Transform each device to include pre-signed URLs for images
        const updatedDevices = await Promise.all(
            devices.map(async (device) => {
                device.images = await Promise.all(
                    device.images.map(async (image: any) => await this.s3Service.getPresignedUrl(image))
                );
                return device;
            })
        );

        return updatedDevices;
    }

    async findOne(id: string): Promise<Device> {
        const pipeline = [
            { $match: { id } },
            ...getLookupPipeline(),
        ];
        const [result]:any = await this.deviceModel.aggregate(pipeline).exec();
        result.images = await Promise.all(result.images.map(async (image: any) => await this.s3Service.getPresignedUrl(image)))
        if (!result || result.length === 0) throw new NotFoundException(`Device with ID ${id} not found`);
        return result;
    }

    async update(
        id: string,
        name: string,
        description: string,
        categories_id: string[],
        images: string[],
    ): Promise<Device> {
        const updatedDevice = await this.deviceModel
            .findOneAndUpdate(
                { id },
                { name, description, categories_id, $push: { images: { $each: images } } },
                { new: true },
            )
            .exec();
        if (!updatedDevice) throw new NotFoundException(`Device with ID ${id} not found`);
        return updatedDevice;
    }

    async delete(id: string): Promise<void> {
        const result = await this.deviceModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) throw new NotFoundException(`Device with ID ${id} not found`);
    }
}
