import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
import {Payment} from "../models/payment.model";
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../models/order.model';
import { Model } from 'mongoose';

@Injectable()
export class PaymentService {
    private razorpay: InstanceType<typeof Razorpay>;

    constructor(
        @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
        @InjectModel(Order.name) private OrderModel: Model<Order>,
    ) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, receipt: string) {
        const options = {
            amount: amount * 100, // Razorpay works with paise, not rupees
            currency: "INR",
            receipt,
        };
        const order = await this.razorpay.orders.create(options);
        return order;
    }

    async verifyPayment(signature: string, orderId: string, paymentId: string) {
        const body = `${orderId}|${paymentId}`;
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(body);
        const expectedSignature = hmac.digest('hex');

        if (expectedSignature === signature) {
            const payment = await this.PaymentModel.findOneAndUpdate(
                { payment_id: orderId },
                { status: 'complete' }
            );
            await this.OrderModel.findOneAndUpdate(
                { id: payment.order_id },
                { status: 'confirmed' },
                { payment_status: 'paid' }
            );
            return {verified: true};
        } else {
            throw new HttpException(
                'Payment verification failed',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    async processRefund(paymentId: string, amount?: number) {
        console.log("refund in");
        // Prepare refund data
        const refundRequest: any = {payment_id: paymentId};
        if (amount) {
            refundRequest.amount = amount; // Amount in paise (e.g., ₹100 = 10000 paise)
        }

        // Initiate the refund request
        console.log("refund request");
        const refund = await this.razorpay.payments.refund(refundRequest);
        console.log("refund:", refund);

        return {
            success: true,
            message: 'Refund processed successfully',
            refundDetails: refund,
        };
    }

}
