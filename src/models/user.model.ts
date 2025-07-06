import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Schema({timestamps: true})
export class User extends Document {
    @Prop({type: String, unique: true, default: uuidv4}) // Generate UUID by default
    id: string;

    @Prop({required: true})
    firstName: string;

    @Prop({required: true})
    lastName: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true, unique: true})
    phoneNumber: string;

    @Prop({default: false})
    verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({id: 1}, {unique: true});
