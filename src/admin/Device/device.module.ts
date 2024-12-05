import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../../models/device.model';
import { DeviceService } from '../Device/device.service';
import { DeviceController } from '../Device/device.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
