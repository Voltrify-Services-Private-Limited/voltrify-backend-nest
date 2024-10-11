import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class Address extends Document {
    @Prop({type: String, unique: true, default: uuidv4})
    id: string;

    @Prop({ type: String, required: true, ref: 'User' })
    user_id: string;

    @Prop({ type: Boolean, required: false})
    is_default: boolean;

    @Prop({required: true})
    firstName: string;

    @Prop({required: true})
    lastName: string;

    @Prop({required: true, unique: true})
    phoneNumber: string;

    @Prop({required: true})
    addressLine1: string;

    @Prop({required: false})
    addressLine2: string;

    @Prop({required: false})
    landmark: string;

    @Prop({required: true})
    city: string;

    @Prop({required: true})
    state: string;

    @Prop({required: true})
    pincode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({id: 1}, {unique: true});
