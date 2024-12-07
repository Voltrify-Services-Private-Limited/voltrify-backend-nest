import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class VoltrifyDevices extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ type: String, required: true, ref: 'Device' })
  device_id: string;
}

export const VoltrifyDevicesSchema = SchemaFactory.createForClass(VoltrifyDevices);

VoltrifyDevicesSchema.index({ id: 1 }, { unique: true });
