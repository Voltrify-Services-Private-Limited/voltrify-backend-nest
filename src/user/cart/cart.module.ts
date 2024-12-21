import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from '../../models/cart.model';
import { CartController } from '../cart/cart.controller';
import { CartService } from '../cart/cart.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ],
    controllers: [CartController],
    providers: [CartService],
})
export class CartModule {}
