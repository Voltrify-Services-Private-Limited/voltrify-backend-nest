import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res} from '@nestjs/common';
import {ServiceService} from './service.service';
import {Request, Response} from "express";

@Controller('service')
export class ServiceController {
    constructor(private readonly ServiceService: ServiceService) {
    }

    @Post()
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.ServiceService.create(req);
        return res.status(result.statusCode).json(result)
    }

    @Get(':condition')
    async findWithFilters(@Req() req: Request, @Res() res: Response) {
        const result = await this.ServiceService.findWithFilters(req);
        return res.status(result.statusCode).json(result)
    }

    @Patch(':id')
    async update(@Req() req: Request, @Res() res: Response) {
        const result = await this.ServiceService.update(req);
        return res.status(result.statusCode).json(result)
    }

    @Get()
    async findAll(@Req() req: Request, @Res() res: Response) {
        const result = await this.ServiceService.findAll(req);
        return res.status(result.statusCode).json(result)
    }

    @Delete(':id')
    async remove(@Req() req: Request, @Res() res: Response) {
        const result = await this.ServiceService.remove(req);
        return res.status(result.statusCode).json(result)
    }
}
