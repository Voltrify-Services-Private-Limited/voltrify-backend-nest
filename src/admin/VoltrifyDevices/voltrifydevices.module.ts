import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoltrifyDevicesService } from '../VoltrifyDevices/voltrifydevices.service';
import { VoltrifyDevicesController } from './voltrifydevicesController';
import { VoltrifyDevices, VoltrifyDevicesSchema } from '../../models/voltrify_devices.model';
import { Device, DeviceSchema } from '../../models/device.model';
import { Category, CategorySchema } from '../../models/category.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VoltrifyDevices.name, schema: VoltrifyDevicesSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [VoltrifyDevicesService],
  controllers: [VoltrifyDevicesController],
})
export class VoltrifyDevicesModule {}
