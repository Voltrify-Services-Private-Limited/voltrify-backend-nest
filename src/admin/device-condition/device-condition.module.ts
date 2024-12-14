import {Module} from '@nestjs/common';
import {DeviceConditionService} from './device-condition.service';
import {DeviceConditionController} from './device-condition.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {DeviceCondition, DeviceConditionSchema} from "../../models/device_condition.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: DeviceCondition.name, schema: DeviceConditionSchema}
        ])
    ],
    controllers: [DeviceConditionController],
    providers: [DeviceConditionService],
})
export class DeviceConditionModule {
}
