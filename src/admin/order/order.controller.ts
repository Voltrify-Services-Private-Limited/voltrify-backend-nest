import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Request, Response } from 'express';

@Controller('admin/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {
    }
    @Get()
    async getAllOrders(@Req() req: Request, @Res() res: Response) {
        const result = await this.orderService.getAllOrders();
        return res.status(result.statusCode).json(result);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orderService.findOne(+id);
    }
    @Patch()
    async updateOrder(@Req() req: Request, @Res() res: Response) {
        const result = await this.orderService.updateOrder(req);
        return res.status(result.statusCode).json(result);
    }
}
