import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from '../../models/cart.model';
import { errorResponse, successResponse } from '../../utils/response.util'; 

@Injectable()
export class CartService {
    constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>) { }

    async create(data: any) {
        const newCart = await this.cartModel.create(data);
        return successResponse(201, 'Cart created successfully');
    }
    async findAll() {
        const carts = await this.cartModel.find({ deleted_at: null }).exec();
        return successResponse(200, 'Carts retrieved successfully', carts);
    }
    async remove(id: string) {
        const cart = await this.cartModel.findOneAndUpdate(
            { id: id },
            { deleted_at: new Date() },
            { new: true, fields: { deleted_at: 1 } }
        );
        if (!cart) {
            return errorResponse(404, 'Cart not found');
        }
        return successResponse(200, 'Cart deleted successfully');
    }
}
