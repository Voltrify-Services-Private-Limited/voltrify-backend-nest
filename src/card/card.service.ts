import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../models/card.model';
import { User } from '../models/user.model';
import { Admin } from '../models/admin.model';
import { successResponse, errorResponse } from '../utils/response.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardService {
    constructor(
        @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    ) { }

    async createCard(req: any) {
        const { ownerId, type, balance, expiryDate, createdBy } = req;

        const owner =
            (await this.userModel.findOne({ id: ownerId }).exec()) ||
            (await this.adminModel.findOne({ id: ownerId }).exec());

        if (!owner) return errorResponse(404, 'Owner not found');

        const card = new this.cardModel({
            id: uuidv4(),
            cardId: `CARD-${Date.now()}-${uuidv4()}`, 
            ownerId,
            type,
            balance,
            expiryDate,
            createdBy,
        });

        await card.save();
        return successResponse(201, 'Card created successfully');
    }

    // Admin/User: Get all cards
    async getAllCards() {
        const cards = await this.cardModel.find().select('-_id').exec();
        return successResponse(200, 'Cards fetched successfully', cards);
    }

    // User: Get own cards
    async getUserCards(ownerId: string) {
        const cards = await this.cardModel.find({ ownerId }).select('-_id').exec();
        return successResponse(200, 'User cards fetched successfully', cards);
    }

    // Admin: Deactivate card
    async deactivateCard(cardId: string) {
        const card = await this.cardModel.findOneAndUpdate(
            { cardId },
            { status: 'INACTIVE' },
            { new: true },
        );

        if (!card) return errorResponse(404, 'Card not found');
        return successResponse(200, 'Card deactivated successfully');
    }

    async deleteCard(cardId: string) {
        const card = await this.cardModel.findOneAndDelete({ cardId });
        if (!card) return errorResponse(404, 'Card not found');
        return successResponse(200, 'Card deleted successfully');
    }
    
}
