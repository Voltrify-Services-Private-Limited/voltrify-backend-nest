import {Module} from '@nestjs/common';
import {OrderService} from './order.service';
import {OrderController} from './order.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Order, OrderSchema} from "../../models/order.model";
import {Service, ServiceSchema} from "../../models/service.model";
import {Cart, CartSchema} from "../../models/cart.model";
import {Payment, PaymentSchema} from "../../models/payment.model";
import {PaymentService} from "../../payment/payment.service"

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Order.name, schema: OrderSchema},
            {name: Service.name, schema: ServiceSchema},
            {name: Cart.name, schema: CartSchema},
            {name: Payment.name, schema: PaymentSchema}
        ])
    ],
    controllers: [OrderController],
    providers: [OrderService, PaymentService],
})
export class OrderModule {
}
