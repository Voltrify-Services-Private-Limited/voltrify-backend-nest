import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {OrderController} from './order.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Order, OrderSchema} from "../../models/order.model";
import {Service, ServiceSchema} from "../../models/service.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Order.name, schema: OrderSchema},
            {name: Service.name, schema: ServiceSchema}
        ])
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {
}
