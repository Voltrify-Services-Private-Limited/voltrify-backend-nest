import { Controller, Get, Post, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Request, Response } from 'express';

@Controller('user/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post()
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.cartService.create(req.body);
        return res.status(result.statusCode).json(result);
    }
    @Get()
    async findAll(@Req() req: Request, @Res() res: Response) {
        const result = await this.cartService.findAll();
        return res.status(result.statusCode).json(result);
    }
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        const result = await this.cartService.remove(id);
        return res.status(result.statusCode).json(result);
    }
}