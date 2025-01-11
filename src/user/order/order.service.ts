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
        const orders = await this.OrderModel.find();
        return successResponse(200, "Orders fetched successfully", orders);
    }    
   
    async getOrderById(orderId: string) {
        const order = await this.OrderModel.findOne({ id: orderId }); 
          if (!order) {
            return errorResponse(404, "Order not found");
        }   
        return successResponse(200, "Order fetched successfully", order);
    }  


    async updateOrder(orderId: string, updateOrderData: any) {
        console.log("Request body in service:", updateOrderData); 
    
        const { service_id, visiting_charge, service_charge, components_charge, discount, time_slot, status, payment_status, payment_mode, coupons_code, store_id, technician_id, notes, updated_by } = updateOrderData || {};
        console.log('Service ID from body:', service_id);
    
        if (!service_id) {
            return errorResponse(400, "Service ID is required");
        }
    
        // Check if the order exists
        const order = await this.OrderModel.findOne({ id: orderId });
        if (!order) {
            return errorResponse(404, "Order not found");
        }
    
        // Fetch related service and perform recalculations
        const service = await this.ServiceModel.findOne({ id: service_id });
        if (!service) {
            return errorResponse(404, "Service not found");
        }
    
        const serviceDuration = service.duration;
        const serviceType = service.type;
    
        // Ensure that the charge fields are numbers
        const visitingCharge = Number(visiting_charge) || 0;
        const serviceCharge = Number(service_charge) || 0;
        const totalCharges = visitingCharge + serviceCharge;
    
        // Validate and calculate GST (if discount exists)
        const validDiscount = Number(discount) || 0;
        const gst = (totalCharges - validDiscount) * 0.18; // Assuming 18% GST
        const finalAmount = totalCharges - validDiscount + gst;
    
        // Update the order data with recalculated values
        const updatedOrder = await this.OrderModel.findOneAndUpdate(
            { id: orderId },
            {
                service_id,
                service_duration: serviceDuration,
                service_type: serviceType,
                time_slot,
                status: status || order.status,
                payment_status: payment_status || order.payment_status,
                payment_mode,
                coupons_code,
                store_id,
                technician_id,
                notes,
                updated_by,
                total_charges: totalCharges,
                discount: validDiscount,
                total_gst: gst,
                final_amount: finalAmount,
                components_charge: components_charge || order.components_charge,
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
        const updatedOrder = await this.OrderModel.findOneAndUpdate(
            { id: orderId },
            { status: 'cancelled' },
            { new: true }
        );
        return successResponse(200, 'Order cancelled successfully', updatedOrder);
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