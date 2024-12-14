import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res} from '@nestjs/common';
import {DeviceConditionService} from './device-condition.service';
import {Request, Response} from "express";


@Controller('device-condition')
export class DeviceConditionController {
    constructor(private readonly deviceConditionService: DeviceConditionService) {
    }

    @Post()
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceConditionService.addNewCondition(req);
        return res.status(result.statusCode).json(result)
    }

    @Get(':id')
    async findOne(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceConditionService.findOne(req);
        return res.status(result.statusCode).json(result)
    }

    @Patch()
    async update(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceConditionService.update(req);
        return res.status(result.statusCode).json(result)
    }

    @Get()
    async findAll(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceConditionService.findAll(req);
        return res.status(result.statusCode).json(result)
    }

    @Delete(':id')
    async remove(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceConditionService.remove(req);
        return res.status(result.statusCode).json(result)
    }
}
