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
        const { expiry, cardHolderName, cardNumber } = req.body;

        if (!expiry || !cardHolderName || !cardNumber) {
            return errorResponse(400, 'All fields (cardNumber, cardHolderName, expiry) are required.');
        }

        const existingCard = await this.cardModel.findOne({ cardNumber });
        if (existingCard) {
            return errorResponse(400, 'A card with this number already exists.');
        }

        // Create new card
        const card = new this.cardModel({
            id: uuidv4(),
            userId: req.user.id,
            cardHolderName,
            cardNumber,
            expiry
        });

        await card.save();
        return successResponse(201, 'Card created successfully');
    }


    async getUserCards(req: any) {
        const cards = await this.cardModel.find({ userId: req.user.id }).select('-_id').exec();
        return successResponse(200, 'User cards fetched successfully', cards);
    }

    async getUserCard(cardId: string) {
        const card = await this.cardModel.findOne({ id: cardId }).select('-_id').exec();
        return successResponse(200, 'User cardId fetched successfully', card);
    }


    async deleteCard(cardId: string) {
        const card = await this.cardModel.findOneAndDelete({ id: cardId });
        if (!card) return errorResponse(404, 'Card not found or unauthorized access');
        return successResponse(200, 'Card deleted successfully');
    }
    
}
