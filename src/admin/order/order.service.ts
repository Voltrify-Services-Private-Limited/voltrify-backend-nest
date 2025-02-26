import { Injectable } from '@nestjs/common';
import { errorResponse, successResponse } from '../../utils/response.util';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../../models/order.model';
import { Model } from 'mongoose';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private OrderModel: Model<Order>,
    ) {
    }
    async getAllOrders() {
        const orders = await this.OrderModel.aggregate([
            {
                $lookup: {
                    from: 'devices',
                    localField: 'device_id',
                    foreignField: 'id',
                    as: 'deviceDetails',
                },
            },{
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: 'id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: {
                    path: '$deviceDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    created_at: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    user_id: 1,
                    address_id: 1,
                    device_id: 1,
                    user_description: 1,
                    service_id: 1,
                    service_type: 1,
                    condition_id: 1,
                    time_slot: 1,
                    date: 1,
                    service_duration: 1,
                    status: 1,
                    payment_status: 1,
                    payment_mode: 1,
                    coupons_code: 1,
                    visiting_charge: 1,
                    service_charge: 1,
                    total_charges: 1,
                    final_amount: 1,
                    created_by: 1,
                    components_charge: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    payment: 1,
                    deviceDetails: {name: 1},
                    userDetails: {firstName: 1, lastName: 1, phoneNumber: 1},
                }
            }
        ]);

        if (!orders || orders.length === 0) {
            return errorResponse(404, 'No orders found');
        }

        return successResponse(200, 'Order details fetched successfully', orders);
    }

    findOne(id: number) {
        return `This action returns a #${id} order`;
    }

    async updateOrder(req: any){
        const { id, status} = req.body;
        const order = await this.OrderModel.findOne({ id: id });
        if (!order) {
            return errorResponse(404, "Order not found");
        }
        order.status = status.toLowerCase();
        await order.save();
        return successResponse(200, 'Order updated successfully');
    }
}
