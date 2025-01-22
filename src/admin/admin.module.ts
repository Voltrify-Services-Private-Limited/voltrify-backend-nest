import {Module} from '@nestjs/common';
import {AdminService} from './admin.service';
import {AdminController} from './admin.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Admin, AdminSchema} from "../models/admin.model";
import {Category, CategorySchema} from "../models/category.model";
import {Device, DeviceSchema} from "../models/device.model";
import {DeviceCondition, DeviceConditionSchema} from "../models/device_condition.model";
import {Order, OrderSchema} from "../models/order.model";
import {Service, ServiceSchema} from "../models/service.model";
import {VoltrifyDevices, VoltrifyDevicesSchema} from "../models/voltrify_devices.model";
import { CategoryController } from './Category/category.controller';
import { CategoryService } from './Category/category.service';
import { DeviceService } from './Device/device.service';
import { DeviceController } from './Device/device.controller';
import { VoltrifyDevicesController } from './VoltrifyDevices/voltrifydevicesController';
import { VoltrifyDevicesService } from './VoltrifyDevices/voltrifydevices.service';
import { DeviceConditionModule } from './device-condition/device-condition.module';
import { ServiceModule } from './service/service.module';
import { Coupon, CouponSchema } from 'src/models/coupon.model';
import { AdminCouponController } from './coupon/coupon.controller';
import { AdminCouponService } from './coupon/coupon.service';
import { S3Service } from '../s3.service';



@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Admin.name, schema: AdminSchema},
            {name: Category.name, schema: CategorySchema},
            {name: Device.name, schema: DeviceSchema},
            {name: DeviceCondition.name, schema: DeviceConditionSchema},
            {name: VoltrifyDevices.name, schema: VoltrifyDevicesSchema},
            {name: Order.name, schema: OrderSchema},
            {name: Service.name, schema: ServiceSchema},
            {name: Coupon.name, schema: CouponSchema}

        ]),
        DeviceConditionModule,
        ServiceModule,

        
    ],
    controllers: [AdminController,CategoryController,DeviceController,VoltrifyDevicesController,AdminCouponController],
    providers: [AdminService,CategoryService,DeviceService,VoltrifyDevicesService,AdminCouponService, S3Service],
    
})
export class AdminModule {
}

