import { Body, Controller, Get, Param, Put,Delete,Post,Res,UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { Response } from 'express';
import {AuthGuard} from "../../auth/guards/auth/auth.guard";


@Controller('user/card')
export class CardController {
    constructor(private readonly cardService: CardService) { }

    @Post()
    @UseGuards(AuthGuard)
        async createCard(@Body() req: any, @Res() res: Response) {
        const result = await this.cardService.createCard(req);
        return res.status(result.statusCode).json(result);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllCards(@Res() res: Response) {
        const result = await this.cardService.getAllCards();
        return res.status(result.statusCode).json(result);
    }
    
    @Get(':userId')
    @UseGuards(AuthGuard)
    async getUserCards(@Param('userId') userId: string, @Res() res: Response) {
        const result = await this.cardService.getUserCards(userId);
        return res.status(result.statusCode).json(result);
    }
   
    @Put('deactivate/:cardId')
    @UseGuards(AuthGuard)
    async deactivateCard(@Param('cardId') cardId: string, @Res() res: Response) {
        const result = await this.cardService.deactivateCard(cardId);
        return res.status(result.statusCode).json(result);
    }

    @Delete(':cardId')
    @UseGuards(AuthGuard)
    async deleteCard(@Param('cardId') cardId: string, @Res() res:Response) {
        const result = await this.cardService.deleteCard(cardId);
        return res.status(result.statusCode).json(result);
    }
}
