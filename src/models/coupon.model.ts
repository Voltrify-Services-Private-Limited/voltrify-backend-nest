import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {v4 as uuidv4} from 'uuid';
export type CouponDocument = Coupon & Document;

@Schema()
export class Coupon extends Document {
  @Prop({type: String, unique: true, default: uuidv4})
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  originalPrice: number;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true, enum: ['rate', 'percentage'], default: 'percentage' })
  discountType: 'rate' | 'percentage';

  @Prop({ required: false, default: () => new Date() })
  validFrom: Date;

  @Prop({ default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1)) })
  validTo: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  deleted_at: Date | null;

}  
export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ id: 1 }, { unique: true });
