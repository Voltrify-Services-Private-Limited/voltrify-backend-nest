import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoltrifyDevices } from '../../models/voltrify_devices.model';
import { Device } from '../../models/device.model';
import { Category } from '../../models/category.model';

@Injectable()
export class VoltrifyDevicesService {
  constructor(
    @InjectModel(VoltrifyDevices.name) private voltrifyDevicesModel: Model<VoltrifyDevices>,
    @InjectModel(Device.name) private deviceModel: Model<Device>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  private async aggregateDeviceData(deviceId?: string) {
    const pipeline: any[] = [
      ...(deviceId ? [{ $match: { device_id: deviceId } }] : []), 
      {
        $lookup: {
          from: 'devices',
          localField: 'device_id',
          foreignField: 'id',
          as: 'deviceDetails',
        },
      },
      { $unwind: '$deviceDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'deviceDetails.categories',
          foreignField: 'id',
          as: 'categoriesDetails',
        },
      },
      { $unwind: { path: '$categoriesDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$device_id',
          deviceName: { $first: '$deviceDetails.name' },
          deviceDescription: { $first: '$deviceDetails.description' },
          images: { $first: '$deviceDetails.images' },
          categories: {
            $push: {
              id: '$categoriesDetails.id',
              name: '$categoriesDetails.name',
              image: '$categoriesDetails.image',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          deviceName: 1,
          deviceDescription: 1,
          images: 1,
          'categories.id': 1,
          'categories.name': 1,
          'categories.image': 1,
        },
      },
    ];

    return this.voltrifyDevicesModel.aggregate(pipeline);
  }

  async getDevices() {
    const devices = await this.aggregateDeviceData();
    return {
      statusCode: 200,
      message: devices.length ? 'Devices found' : 'No devices found',
      data: devices,
    };
  }

  async getDeviceById(deviceId: string) {
    const devices = await this.aggregateDeviceData(deviceId);
    if (!devices.length) {
      throw new NotFoundException('Device not found');
    }
    return {
      statusCode: 200,
      message: 'Device found',
      data: devices[0],
    };
  }

  async createDevice(deviceId: string) {
    const newDevice = new this.voltrifyDevicesModel({ device_id: deviceId });
    return await newDevice.save();
  }

  async deleteDevice(deviceId: string) {
    return await this.voltrifyDevicesModel.deleteOne({ device_id: deviceId });
  }
}