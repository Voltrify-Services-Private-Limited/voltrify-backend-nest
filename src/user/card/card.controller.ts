import { Body, Controller, Get, Param, Put, Delete, Post, Res, Req, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { Request, Response } from 'express';
import { AuthGuard } from '../../auth/guards/auth/auth.guard';


@Controller('user/card')
export class CardController {
    constructor(private readonly cardService: CardService) {
    }

    @Post()
    @UseGuards(AuthGuard)
    async createCard(@Req() req: Request, @Res() res: Response) {
        const result = await this.cardService.createCard(req);
        return res.status(result.statusCode).json(result);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getUserCards(@Req() req: Request, @Res() res: Response) {
        const result = await this.cardService.getUserCards(req);
        return res.status(result.statusCode).json(result);
    }

    @Get('card/:cardId')
    @UseGuards(AuthGuard)
    async getUserCard(@Param('cardId') cardId: string, @Res() res: Response) {
        const result = await this.cardService.getUserCard(cardId);
        return res.status(result.statusCode).json(result);
    }

    @Delete(':cardId')
    @UseGuards(AuthGuard)
    async deleteCard(@Param('cardId') cardId: string, @Res() res: Response) {
        const result = await this.cardService.deleteCard(cardId);
        return res.status(result.statusCode).json(result);
    }
}
