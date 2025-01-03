import {Injectable, HttpException, HttpStatus} from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
    private razorpay: InstanceType<typeof Razorpay>;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, currency: string, receipt: string) {
        const options = {
            amount: amount * 100, // Razorpay works with paise, not rupees
            currency,
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
            return { verified: true };
        } else {
            throw new HttpException(
                'Payment verification failed',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

}
