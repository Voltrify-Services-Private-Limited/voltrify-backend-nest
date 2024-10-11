import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class ServiceType extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: String, required: true, ref: 'Device' })
  device_id: string;
}

export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);

ServiceTypeSchema.index({ id: 1 }, { unique: true });
