import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ type: String, unique: true, default: uuidv4 })
    id: string;

    @Prop({ type: String, required: true, ref: 'Service' })
    service_id: string;

    @Prop({ type: String, required: true, ref: 'User' })
    user_id: string;

    @Prop({ type: Date, default: null })
    deleted_at: Date | null;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ id: 1 }, { unique: true });