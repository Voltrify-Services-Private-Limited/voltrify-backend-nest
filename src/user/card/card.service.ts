import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../../models/card.model';
import { User } from '../../models/user.model';
import { successResponse, errorResponse } from '../../utils/response.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardService {
    constructor(
        @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async createCard(req: any) {
        const { userId, type, balance, expiryDate, createdBy } = req;

        const user =
            (await this.userModel.findOne({ id: userId }).exec());

        if (!user) return errorResponse(404, 'User not found');

        const card = new this.cardModel({
            id: uuidv4(),
            cardId: `CARD-${Date.now()}-${uuidv4()}`, 
            userId,
            type,
            balance,
            expiryDate,
            createdBy,
        });

        await card.save();
        return successResponse(201, 'Card created successfully');
    }

    async getAllCards() {
        const cards = await this.cardModel.find().select('-_id').exec();
        return successResponse(200, 'Cards fetched successfully', cards);
    }

    async getUserCards(userId: string) {
        const cards = await this.cardModel.find({ userId }).select('-_id').exec();
        return successResponse(200, 'User cards fetched successfully', cards);
    }

    async deactivateCard(cardId: string) {
        const card = await this.cardModel.findOneAndUpdate(
            { cardId },
            { status: 'INACTIVE' },
            { new: true },
        );

        if (!card) return errorResponse(404, 'Card not found or unauthorized access');
        return successResponse(200, 'Card deactivated successfully');
    }

    async deleteCard(cardId: string) {
        const card = await this.cardModel.findOneAndDelete({ cardId });
        if (!card) return errorResponse(404, 'Card not found or unauthorized access');
        return successResponse(200, 'Card deleted successfully');
    }
    
}
