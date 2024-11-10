import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class StoreService extends Document {
    @Prop({type: String, unique: true, default: uuidv4})
    id: string;

    @Prop({type: String, required: true, ref: 'Store'})
    store_id: string;

    @Prop({type: String, required: true, ref: 'Device'})
    device_id: string;

    @Prop({required: true})
    name: string;

    @Prop({required: false})
    description: string;

    @Prop({type: Number, required: true})
    price: number;

    @Prop({type: Number, required: true})
    visiting_charge: number;
}

export const StoreServiceSchema = SchemaFactory.createForClass(StoreService);

StoreServiceSchema.index({id: 1}, {unique: true});
