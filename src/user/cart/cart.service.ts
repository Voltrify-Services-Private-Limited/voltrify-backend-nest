import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from '../../models/cart.model';
import { errorResponse, successResponse } from '../../utils/response.util';

@Injectable()
export class CartService {
    constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>) {
    }

    async create(data: any) {
        const newCart = await this.cartModel.create(data);
        return successResponse(201, 'Cart created successfully');
    }

    async findAll() {
        const carts = await this.cartModel.aggregate([
            {
                $match: { deleted_at: null }, // Filter out soft-deleted carts
            },
            {
                $lookup: {
                    from: 'services', // Ensure correct MongoDB collection name
                    localField: 'service_id', // Field in Cart (UUID)
                    foreignField: 'id', // Field in Service (UUID)
                    as: 'serviceDetails',
                },
            },
            {
                $lookup: {
                    from: 'devices', // Ensure correct MongoDB collection name
                    localField: 'serviceDetails.device_id', // Field inside Service (UUID)
                    foreignField: 'id', // Field in Device (UUID)
                    as: 'deviceDetails',
                },
            },
            {
                $project: {
                    id: 1,
                    service_id: 1,
                    user_id: 1,
                    deleted_at: 1,
                    service_name: { $arrayElemAt: ['$serviceDetails.name', 0] }, // Get first element
                    device_name: { $arrayElemAt: ['$deviceDetails.name', 0] }, // Get first element
                },
            },
        ]);

        return successResponse(200, 'Carts retrieved successfully', carts);
    }


    async remove(id: string) {
        const cart = await this.cartModel.findOneAndUpdate(
            { id: id },
            { deleted_at: new Date() },
            { new: true, fields: { deleted_at: 1 } },
        );
        if (!cart) {
            return errorResponse(404, 'Cart not found');
        }
        return successResponse(200, 'Cart deleted successfully');
    }
}
