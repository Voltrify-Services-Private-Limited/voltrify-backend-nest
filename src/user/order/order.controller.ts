import {Controller, Post, Get, Param, Put, Delete, Body, Query, Req, Res, UseGuards} from '@nestjs/common';
import { OrderService } from './order.service';
import {AuthGuard} from "../../auth/guards/auth/auth.guard";
import {Request, Response} from "express";

@Controller('user/orders')
@UseGuards(AuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    // Create an order
    @Post()
    async create(@Req() req: Request, @Res() res: Response) {
        const result =  await this.orderService.create(req);
        return res.status(result.statusCode).json(result)
    }
}