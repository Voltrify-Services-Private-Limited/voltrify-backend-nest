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

    @Get()
    async getAllOrders(@Req() req: Request, @Res() res: Response) {
        const result = await this.orderService.getAllOrders();
        return res.status(result.statusCode).json(result);
    }

    @Get(':orderId')
    async getOrderById(@Param('orderId') orderId: string, @Res() res: Response) {
        const result = await this.orderService.getOrderById(orderId);
        return res.status(result.statusCode).json(result);
    }

    @Put(':orderId')
    async updateOrder(@Param('orderId') orderId: string,@Body() updateOrderData: any,@Res() res: Response) {
        const result = await this.orderService.updateOrder(orderId, updateOrderData);
        return res.status(result.statusCode).json(result);  
    }

    @Put('cancel/:orderId')
    async cancelOrder( @Param('orderId') orderId: string,@Res() res: Response ) {
        const result = await this.orderService.cancelOrder(orderId);
        return res.status(result.statusCode).json(result);
    }

    @Put('reschedule/:orderId')
    async rescheduleOrder(@Param('orderId') orderId: string, @Body() updateOrderData: any,  @Res() res: Response) {
        const result = await this.orderService.rescheduleOrder(orderId, updateOrderData);
        return res.status(result.statusCode).json(result);
    }
}