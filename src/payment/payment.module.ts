import {Module} from '@nestjs/common';
import {PaymentService} from './payment.service';
import {PaymentController} from './payment.controller';
import {HttpModule} from '@nestjs/axios';
import {Payment, PaymentSchema} from "../models/payment.model";
import {Order, OrderSchema} from "../models/order.model";
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{name: Payment.name, schema: PaymentSchema}]),
        MongooseModule.forFeature([{name: Order.name, schema: OrderSchema}]),
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {
}
