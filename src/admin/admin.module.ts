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

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Admin.name, schema: AdminSchema},
            {name: Category.name, schema: CategorySchema},
            {name: Device.name, schema: DeviceSchema},
            {name: DeviceCondition.name, schema: DeviceConditionSchema},
            {name: VoltrifyDevices.name, schema: VoltrifyDevicesSchema},
            {name: Order.name, schema: OrderSchema},
            {name: Service.name, schema: ServiceSchema}
        ])
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {
}
