import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import { ServiceType } from '../utils/types/service-type.enum';

@Schema({timestamps: true})
export class Service extends Document {
    @Prop({type: String, unique: true, default: uuidv4})
    id: string;

    @Prop({type: String, required: true, ref: 'Device'})
    device_id: string;

    @Prop({type: String, required: true, ref: 'Category'})
    category_id: string;

    @Prop({required: true})
    name: string;

    @Prop({ type: String, enum: ServiceType, required: true })
    type: ServiceType;

    @Prop({ type: Number, required: false })
    duration: number;  // in minutes

    @Prop({required: false})
    description: string;

    @Prop({type: Number, required: true})
    price: number;

    @Prop({type: Number, required: true})
    visiting_charge: number;

    @Prop({type: [String], required: true})
    city: string[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({id: 1}, {unique: true});

ServiceSchema.pre('save', function (next) {
    if (this.city && Array.isArray(this.city)) {
      this.city = this.city.map((c) => c.toLowerCase());
    }
    next();
  });