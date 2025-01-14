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
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name) private OrderModel: Model<Order>,
        @InjectModel(Service.name) private ServiceModel: Model<Service>,
        @InjectModel(Cart.name) private CartModel: Model<Cart>,
        @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
        private readonly paymentService: PaymentService
    ) {
    }

    // Create a new order with calculations and service details
    async create(req: any) {
        const userId = req.user.id
        const cartId = req.body.cart_id
        const addressId = req.body.address_id

        const conditionId = req.body.condition_id
        const timeSlot = req.body.time_slot
        const couponsCode = req.body.coupons_code
        const paymentMode = req.body.payment_mode
        const userDescription = req.body.service_description

        const cart = await this.CartModel.findOne({id: cartId, user_id: userId, deleted_at: null})
        if (!cart) {
            return errorResponse(404, "Cart not found");
        }
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
        const discount = 0;
        // const gst = (totalCharges - discount) * 0.18; // Assuming 18% GST
        // const finalAmount = totalCharges - discount + gst;
        const finalAmount = totalCharges - discount;
        const orderId = uuidv4()

        // Prepare the order data
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
            discount: discount,
            // total_gst: gst,
            final_amount: finalAmount,
            created_by: userId,
        });
        // Save the order
        await newOrder.save();
        const paymentOrder = await this.paymentService.createOrder(finalAmount, orderId)
        console.log("this is razorpay order: ", paymentOrder)

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
        const data:any = {
            amount: paymentOrder.amount,
            status: paymentOrder.status,
            payment_created_at: paymentOrder.created_at,
            razorpay_order_id: paymentOrder.id,
            receipt: paymentOrder.receipt,
        }
        return successResponse(201, "Order Created", data);
    }


    async getAllOrders() {
        const orders = await this.OrderModel.find();
        return successResponse(200, "Orders fetched successfully", orders);
    }

    async getOrderById(orderId: string) {
        const order = await this.OrderModel.findOne({ id: orderId });
        if (!order) {
            return errorResponse(404, 'Order not found');
        }
        const payment = await this.PaymentModel.findOne({ order_id: orderId });

        if (!payment) {
            return errorResponse(404, 'Payment not found for this order');
        }

        return successResponse(200, 'Order details fetched successfully', {
            order,
            payment: {
                payment_id: payment.payment_id,
                status: payment.status,
                amount: payment.amount
            }
        });
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

        const paymentOrder = await this.paymentService.processRefund(payment.payment_id)

        return successResponse(200, 'Order cancelled successfully', {
            order: updatedOrder,
            payment: {
                payment_id: payment.payment_id, // Payment or transaction ID
                status: payment.status,
                amount: payment.amount
            }
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