import {Injectable} from '@nestjs/common';
import {Request} from "express";
import {errorResponse, successResponse} from "../../utils/response.util";
import {InjectModel} from "@nestjs/mongoose";
import {Order} from "../../models/order.model";
import {Model} from "mongoose";
import {Service} from '../../models/service.model';
import {Cart} from "../../models/cart.model";
import {Payment} from "../../models/payment.model";
import {PaymentService} from "../../payment/payment.service"
import {Refund} from "../../models/refund.model";
import {v4 as uuidv4} from 'uuid';
import { S3Service } from '../../s3.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private OrderModel: Model<Order>,
        @InjectModel(Service.name) private ServiceModel: Model<Service>,
        @InjectModel(Cart.name) private CartModel: Model<Cart>,
        @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
        @InjectModel(Refund.name) private RefundModel: Model<Refund>,
        private readonly paymentService: PaymentService,
        private readonly s3Service: S3Service
    ) {
    }

    // Create a new order with calculations and service details
    async create(req: any) {
        const {
            cart_id,
            address_id,
            condition_id,
            time_slot,
            date,
            coupons_code,
            payment_mode,
            service_description,
            device_brand,
            device_model
        } = req.body;

        if (!cart_id || !address_id || !condition_id || !time_slot || !date || !payment_mode) {
            return errorResponse(400, "Missing required fields");
        }

        // Validate time_slot format (HH:MM AM/PM)
        const timeSlotRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
        if (!timeSlotRegex.test(time_slot)) {
            return errorResponse(400, "Invalid time_slot format. Expected format: HH:MM AM/PM");
        }

        // Validate date format (DD-MM-YYYY)
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}$/;
        if (!dateRegex.test(date)) {
            return errorResponse(400, "Invalid date format. Expected format: DD-MM-YYYY");
        }
        
        const userId = req.user.id;

        // Validate cart existence
        const cart = await this.CartModel.findOne({id: cart_id, user_id: userId, deleted_at: null});
        if (!cart) {
            return errorResponse(404, "Cart not found");
        }

        // Validate service existence
        const service = await this.ServiceModel.findOne({id: cart.service_id});
        if (!service) {
            return errorResponse(404, "Service not found");
        }

        // Perform necessary calculations
        const totalCharges = service.visiting_charge + (service.price || 0);
        const finalAmount = totalCharges;
        const orderId = uuidv4();

        // Prepare and save order
        const newOrder = new this.OrderModel({
            id: orderId,
            user_id: userId,
            address_id,
            device_id: service.device_id,
            user_description: service_description,
            user_device_brand: device_brand,
            user_device_model: device_model,
            service_id: service.id,
            service_duration: service.duration,
            service_type: service.type,
            condition_id,
            time_slot,
            date,
            payment_mode,
            coupons_code,
            visiting_charge: service.visiting_charge,
            service_charge: service.price,
            total_charges: totalCharges,
            final_amount: finalAmount,
            created_by: userId,
        });
        await newOrder.save();

        // Create payment order
        const paymentOrder = await this.paymentService.createOrder(service.visiting_charge, orderId);
        const payment = new this.PaymentModel({
            payment_id: paymentOrder.id,
            user_id: userId,
            order_id: paymentOrder.receipt,
            amount: paymentOrder.amount,
            status: paymentOrder.status,
            payment_created_at: paymentOrder.created_at,
            payment_response: paymentOrder
        });
        await payment.save();

        return successResponse(201, "Order Created", {
            payment_order_id: paymentOrder.id,
            payment_receipt: paymentOrder.receipt,
            payment_amount_due: paymentOrder.amount_due,
            payment_status: paymentOrder.status,
            payment_created_at: paymentOrder.created_at,
        });
    }


    async getAllOrders() {
        const orders = await this.OrderModel.aggregate([
            {
                $lookup: {
                    from: 'payments',
                    localField: 'id',
                    foreignField: 'order_id',
                    as: 'payment',
                },
            },
            {
                $lookup: {
                    from: 'devices',
                    localField: 'device_id',
                    foreignField: 'id',
                    as: 'deviceDetails',
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
                    path: '$payment',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    createdAt: -1
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
                    deviceImages: { $ifNull: ["$deviceDetails.images", []] }, // Only include images
                }
            }
        ]);

        if (!orders || orders.length === 0) {
            return errorResponse(404, 'No orders found');
        }
        const updatedOrders = await Promise.all(
            orders.map(async (order) => {
                if (order.deviceImages){
                    console.log(order.deviceImages);
                    order.deviceImages = await Promise.all(
                        order?.deviceImages?.map(async (image: any) => await this.s3Service.getPresignedUrl(image))
                    );
                }
                return order;
            })
        );
        return successResponse(200, 'Order details fetched successfully', updatedOrders);
    }

    async getOrderById(orderId: string) {
        const order = await this.OrderModel.aggregate([
            {
                $match: { id: orderId } 
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: 'id',
                    foreignField: 'order_id',
                    as: 'payment',
                },
            },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
        ]);
    
        if (!order || order.length === 0) {
            return errorResponse(404, 'Order not found');
        }
    
        return successResponse(200, 'Order details fetched successfully', order[0]);
    }  

    async updateOrder(orderId: string, updateOrderData: any) {
        const { address_id, user_description, condition_id, device_model, device_brand } = updateOrderData || {};

        if (!address_id && !user_description && !condition_id) {
            return errorResponse(400, "At least one field (address_id, user_description, or condition_id) is required");
        }
        const order = await this.OrderModel.findOne({ id: orderId });
        if (!order) {
            return errorResponse(404, "Order not found");
        }
        const updatedOrder = await this.OrderModel.findOneAndUpdate(
            { id: orderId },
            {
                ...(address_id && { address_id }),
                ...(user_description && { user_description }),
                ...(condition_id && { condition_id }),
                ...(device_model && { user_device_model: device_model }),
                ...(device_brand && { user_device_brand: device_brand })
            },
            { new: true }
        );

        return successResponse(200, "Order updated successfully", updatedOrder);
    }

    async cancelOrder(orderId: string) {
        const order = await this.OrderModel.findOne({ id: orderId });

        if (!order) {
            return errorResponse(404, 'Order not found');
        }
        if (order.status !== "confirmed") {
            return errorResponse(400, 'Order is not in confirmed state');
        }
        const payment = await this.PaymentModel.findOne({ order_id: orderId });
        if (!payment) {
            return errorResponse(404, 'Payment not found for this order');
        }
        const updatedOrder = await this.OrderModel.findOneAndUpdate(
            { id: orderId },
            { status: 'cancelled' },
            { new: true }
        );
        const refundId = uuidv4();
        const refund = new this.RefundModel({
            refund_id: refundId,
            order_id: orderId,
            user_id: order.user_id,
            payment_id: payment.payment_id,
            amount: payment.amount,
            reason: 'Order cancelled by user',
            status: 'initiated',
            refund_response: {},
        });
        await refund.save();
        const paymentGatewayResponse = await this.paymentService.processRefund(payment.payment_id, refund.amount);

        refund.refund_response = paymentGatewayResponse;
        refund.status = paymentGatewayResponse.refundDetails && paymentGatewayResponse.refundDetails.status === 'processed' ? 'processed' : 'failed';
        await refund.save();
        
        if (refund.status === 'failed') {
            return errorResponse(500, 'Order cancelled but refund processing failed', {
                order: updatedOrder,
                refund: {
                    refund_id: refund.refund_id,
                    amount: refund.amount,
                    status: refund.status,
                    refund_response: refund.refund_response,
                },
            });
        }     
       return successResponse(200, 'Order cancelled and refund processed successfully', {
            order: updatedOrder,
            refund: {
                refund_id: refund.refund_id,
                amount: refund.amount,
                status: refund.status,
                refund_response: refund.refund_response,
            },
        });
    }

    async rescheduleOrder(orderId: string, updateOrderData: any) {
        const { time_slot } = updateOrderData;

        const order = await this.OrderModel.findOne({ id: orderId });
        if (!order) {
            return errorResponse(404, 'Order not found');
        }
        if (order.status !== "confirmed") {
            return errorResponse(400, 'Order is not in confirmed state');
        }
        if (!time_slot) {
            return errorResponse(400, 'New time slot is required');
        }
        const updatedOrder = await this.OrderModel.findOneAndUpdate(
            { id: orderId },
            { time_slot: time_slot },
            { new: true }
        );
        return successResponse(200, 'Order rescheduled successfully', updatedOrder);
    }

}    