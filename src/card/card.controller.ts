import { Body, Controller, Get, Param, Put,Delete,Post, Res } from '@nestjs/common';
import { CardService } from './card.service';
import { Response } from 'express';

@Controller('card')
export class CardController {
    constructor(private readonly cardService: CardService) { }

    @Post('create')
    async createCard(@Body() req: any, @Res() res: Response) {
        const result = await this.cardService.createCard(req);
        return res.status(result.statusCode).json(result);
    }

    @Get('all')
    async getAllCards(@Res() res: Response) {
        const result = await this.cardService.getAllCards();
        return res.status(result.statusCode).json(result);
    }

    @Get('user/:ownerId')
    async getUserCards(@Param('ownerId') ownerId: string, @Res() res: Response) {
        const result = await this.cardService.getUserCards(ownerId);
        return res.status(result.statusCode).json(result);
    }

    @Put('deactivate/:cardId')
    async deactivateCard(@Param('cardId') cardId: string, @Res() res: Response) {
        const result = await this.cardService.deactivateCard(cardId);
        return res.status(result.statusCode).json(result);
    }

    @Delete(':cardId')
    async deleteCard(@Param('cardId') cardId: string, @Res() res) {
        const result = await this.cardService.deleteCard(cardId);
        return res.status(result.statusCode).json(result);
    }
}
