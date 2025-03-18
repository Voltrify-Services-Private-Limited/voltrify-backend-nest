import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class Payment extends Document {
    @Prop({type: String, unique: true, default: uuidv4})
    id: string;

    @Prop({required: true})
    payment_id: string;

    @Prop({ type: String, required: true, ref: 'User' })
    user_id: string;

    @Prop({type: String, required: true})
    order_id: string;

    @Prop({required: false})
    amount: string;

    @Prop({required: true})
    status: string;

    @Prop({required: true})
    payment_created_at: string;

    @Prop({ type: Object, required: true })
    payment_response: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({id: 1}, {unique: true});


// {
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
