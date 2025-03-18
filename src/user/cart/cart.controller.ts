import { Controller, Get, Post, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Request, Response } from 'express';
import {AuthGuard} from "../../auth/guards/auth/auth.guard";

@Controller('user/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.cartService.create(req);
        return res.status(result.statusCode).json(result);
    }
    @Get()
    @UseGuards(AuthGuard)
    async findAll(@Req() req: Request, @Res() res: Response) {
        const result = await this.cartService.findAll();
        return res.status(result.statusCode).json(result);
    }
    @Delete(':id')
    @UseGuards(AuthGuard)
     async remove(@Param('id') id: string, @Res() res: Response) {
        const result = await this.cartService.remove(id);
        return res.status(result.statusCode).json(result);
    }
}
