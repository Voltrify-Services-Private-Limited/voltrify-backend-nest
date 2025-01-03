import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
    @Prop({ type: String, unique: true, default: uuidv4 })
    id: string;

    @Prop({ type: String, unique: true, required: true })
    cardId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: ['DISCOUNT', 'MEMBERSHIP'] })
    type: string;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
    status: string;

    @Prop()
    expiryDate: Date;

    @Prop()
    createdBy: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.index({ id: 1 }, { unique: true });
CardSchema.index({ cardId: 1 }, { unique: true });
