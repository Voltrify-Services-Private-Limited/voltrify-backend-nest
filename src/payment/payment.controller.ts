import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {PaymentService} from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {
    }

    @Post('verify')
    async verifyPayment(@Body() body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        console.log("event: ", body);
        const isValid = await this.paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        console.log("res:", isValid);
        if (!isValid) {
            return { status: 'failure', message: 'Invalid Razorpay signature' };
        }

        return { status: 'success', message: 'Payment verified successfully' };
    }
}
