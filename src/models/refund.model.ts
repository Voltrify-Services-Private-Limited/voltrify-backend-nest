import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Refund extends Document {
    @Prop({ type: String, unique: true, default: uuidv4 })
    refund_id: string;

    @Prop({ type: String, required: true, ref: 'Order' })
    order_id: string;

    @Prop({ type: String, required: true, ref: 'User' })
    user_id: string;

    @Prop({ type: String, required: true, ref: 'Payment' })
    payment_id: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: String, required: true })
    reason: string;

    @Prop({ type: String, default: 'initiated' })
    status: string;

    @Prop({ type: Object, default: null })
    refund_response: object | null;

    @Prop({ type: Date, default: Date.now })
    refund_created_at: Date;

    @Prop({ type: Date, default: null })
    deleted_at: Date | null;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

RefundSchema.index({ refund_id: 1 }, { unique: true });
