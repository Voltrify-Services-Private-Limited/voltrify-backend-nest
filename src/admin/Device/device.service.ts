import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device} from '../../models/device.model';

@Injectable()
export class DeviceService {
  constructor(@InjectModel(Device.name) private readonly deviceModel: Model<Device>) {}

  async create(name: string, description: string, categories_id: string[]): Promise<Device> {
    const newDevice = new this.deviceModel({ name, description, categories_id });
    return newDevice.save();
  }

  async findAll(): Promise<Device[]> {
    return this.deviceModel.find().exec();
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceModel.findOne({ id }).exec();
    if (!device) throw new NotFoundException(`Device with ID ${id} not found`);
    return device;
  }

  async update(
    id: string,
    name: string,
    description: string,
    categories_id: string[],
  ): Promise<Device> {
    const updatedDevice = await this.deviceModel
      .findOneAndUpdate({ id }, { name, description, categories_id }, { new: true })
      .exec();
    if (!updatedDevice) throw new NotFoundException(`Device with ID ${id} not found`);
    return updatedDevice;
  }

  async delete(id: string): Promise<void> {
    const result = await this.deviceModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException(`Device with ID ${id} not found`);
  }
}
