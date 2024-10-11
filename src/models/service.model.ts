import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class Service extends Document {
    @Prop({type: String, unique: true, default: uuidv4})
    id: string;

    @Prop({required: true})
    name: string;

    @Prop({required: false})
    description: string;

    @Prop({ required: false })
    categories: [string];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({id: 1}, {unique: true});