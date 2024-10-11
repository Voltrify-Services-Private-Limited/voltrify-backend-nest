import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class StoreDevices extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ type: String, required: true, ref: 'Device' })
  device_id: string;

  @Prop({ type: String, required: true, ref: 'Store' })
  store_id: string;
}

export const StoreDevicesSchema = SchemaFactory.createForClass(StoreDevices);

StoreDevicesSchema.index({ id: 1 }, { unique: true });