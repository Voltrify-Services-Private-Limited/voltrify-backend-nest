import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class Otp extends Document {
    @Prop({
        type: String,
        required: true,
        unique: true,
        default: uuidv4(),
    })
    id: string;

    @Prop({
        type: String,
        required: true,
    })
    otp: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    user_id: string;

    @Prop({
        type: Number,
        default: 0,
    })
    count: number;

    @Prop({
        type: Date,
        default: null,
    })
    timeOutTime: Date;

    @Prop({
        type: Date,
    })
    expireAt: Date;


}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({id: 1}, {unique: true});
