import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
    @Prop({ type: String, unique: true, default: uuidv4 })
    id: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ type: String, unique: true, required: true })
    cardNumber: string;

    @Prop({ type: String, required: true })
    cardHolderName: string;


    @Prop({ type: String, required: true })
    expiry: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.index({ id: 1 }, { unique: true });
