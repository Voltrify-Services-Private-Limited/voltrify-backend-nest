import {Controller, Get, Post, Patch, Param, Delete, Req, Res} from '@nestjs/common';
import {AddressService} from './address.service';
import {Request, Response} from "express";

@Controller('user/address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {
    }

    @Post()
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.create(req);
        return res.status(result.statusCode).json(result)
    }
    @Patch(':id')
    async update(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.update(req);
        return res.status(result.statusCode).json(result)
    }

    @Get()
    async findAll(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.findAll(req);
        return res.status(result.statusCode).json(result)
    }

    @Get(':id')
    async findOne(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.findOne(req);
        return res.status(result.statusCode).json(result)
    }

    @Delete(':id')
    async remove(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.remove(req);
        return res.status(result.statusCode).json(result)
    }
}
