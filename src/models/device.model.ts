import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: [String], required: true, ref: 'Category' })
  categories_id: string[];

  @Prop({ type: [String], default: [] }) 
  images: string[];
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ id: 1 }, { unique: true });