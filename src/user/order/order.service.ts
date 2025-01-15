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

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private OrderModel: Model<Order>,
        @InjectModel(Service.name) private ServiceModel: Model<Service>,
        @InjectModel(Cart.name) private CartModel: Model<Cart>,
        @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
        @InjectModel(Refund.name) private RefundModel: Model<Refund>,
        private readonly paymentService: PaymentService
    ) {
    }

    // Create a new order with calculations and service details
    async create(req: any) {
        console.log("in service file")
        const userId = req.user.id
        const cartId = req.body.cart_id
        const addressId = req.body.address_id

        const conditionId = req.body.condition_id
        const timeSlot = req.body.time_slot
        const couponsCode = req.body.coupons_code
        const paymentMode = req.body.payment_mode
        const userDescription = req.body.service_description

        console.log("check-0.1")
        const cart = await this.CartModel.findOne({id: cartId, user_id: userId, deleted_at: null})
        if (!cart) {
            return errorResponse(404, "Cart not found");
        }
        console.log("check-0.2")
        // Fetch related data from Service model based on service_id
        const service = await this.ServiceModel.findOne({id: cart.service_id})
        if (!service) {
            return errorResponse(404, "Service not found");
        }

        // Perform necessary calculations
        const deviceId = service.device_id
        const serviceDuration = service.duration;
        const serviceType = service.type;
        const visitingCharge = service.visiting_charge;
        const serviceCharge = service.price;
        const totalCharges = visitingCharge + (serviceCharge || 0);
        // const gst = (totalCharges - discount) * 0.18; // Assuming 18% GST
        // const finalAmount = totalCharges - discount + gst;
        const finalAmount = totalCharges;
        const orderId = uuidv4()

        // Prepare the order data
        console.log("check-0")
        const newOrder = new this.OrderModel({
            id: orderId,
            user_id: userId,
            address_id: addressId,
            device_id: deviceId,
            user_description: userDescription,
            service_id: service.id,
            service_duration: serviceDuration,
            service_type: serviceType,
            condition_id: conditionId,
            time_slot: timeSlot,
            payment_mode: paymentMode,
            coupons_code: couponsCode,
            visiting_charge: visitingCharge,
            service_charge: serviceCharge,
            total_charges: totalCharges,
            // discount: discount,
            // total_gst: gst,
            final_amount: finalAmount,
            created_by: userId,
        });
        console.log("check-1")
        // Save the order
        await newOrder.save();
        console.log("check-2")
        console.log("till here")
        const paymentOrder = await this.paymentService.createOrder(finalAmount, orderId)
        console.log("this is razorpay order: ", paymentOrder)
        // {x
        //     amount: 85000,
        //     amount_due: 85000,
        //     amount_paid: 0,
        //     attempts: 0,
        //     created_at: 1735689514,
        //     currency: 'INR',
        //     entity: 'order',
        //     id: 'order_PdyOSfyBYo3knw',
        //     notes: [],
        //     offer_id: null,
        //     receipt: '0edd0c91-1d2c-4bb0-a332-9a21d31b4df3',
        //     status: 'created'
        // }
        const payment = new this.PaymentModel({
            payment_id: paymentOrder.id,
            user_id: userId,
            order_id: paymentOrder.receipt,
            amount: paymentOrder.amount,
            status: paymentOrder.status,
            payment_created_at: paymentOrder.created_at,
            payment_response: paymentOrder
        })
        await payment.save();
        return successResponse(201, "Order Created", newOrder);
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
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } }, // Flatten payment array
            { $sort: { created_at: 1 } }, // Sort by creation date
        ]);
    
        if (!orders || orders.length === 0) {
            return errorResponse(404, 'No orders found');
        }
    
        return successResponse(200, 'Order details fetched successfully', orders);
    } 

    async updateOrder(orderId: string, updateOrderData: any) {
        const { address_id, user_description, condition_id } = updateOrderData || {};

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
        const paymentGatewayResponse = await this.paymentService.refundPayment(payment.payment_id, refund.amount);

        refund.refund_response = paymentGatewayResponse;
        refund.status = paymentGatewayResponse.status === 'processed' ? 'processed' : 'failed';
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