import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Device } from '../../models/device.model';

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
  constructor(@InjectModel(Device.name) private readonly deviceModel: Model<Device>) { }

  async create(name: string, description: string, categories_id: any, images: string[]): Promise<Device> {
    // categories_id = JSON.parse(categories_id)
    categories_id = categories_id.split(",")
    const newDevice = new this.deviceModel({ name, description, categories_id, images });
    return newDevice.save();
  }

  async findAll(): Promise<Device[]> {
    const pipeline = getLookupPipeline();
    return this.deviceModel.aggregate(pipeline).exec();
  }

  async findOne(id: string): Promise<Device> {
    const pipeline = [
      { $match: { id } },
      ...getLookupPipeline(),
    ];
    const result = await this.deviceModel.aggregate(pipeline).exec();
    if (!result || result.length === 0) throw new NotFoundException(`Device with ID ${id} not found`);
    return result[0];
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
