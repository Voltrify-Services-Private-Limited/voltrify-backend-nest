import {Module} from '@nestjs/common';
import {ServiceService} from './service.service';
import {ServiceController} from './service.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Service, ServiceSchema} from "../models/service.model";
import {Category, CategorySchema} from "../models/category.model";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
        MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    ],
    controllers: [ServiceController],
    providers: [ServiceService],
})
export class ServiceModule {
}
