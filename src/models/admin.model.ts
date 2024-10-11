import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ type: String, unique: true, default: uuidv4 })
  id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: false })
  verified: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.index({ id: 1 }, { unique: true });