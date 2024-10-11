import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class DeviceCondition extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ type: String, required: true, ref: 'Device' })
  device_id: string;

  @Prop({ type: String, required: true})
  condition: string;
}

export const DeviceConditionSchema = SchemaFactory.createForClass(DeviceCondition);

DeviceConditionSchema.index({ id: 1 }, { unique: true });