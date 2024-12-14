import {Controller, Get, Post, Patch, Param, Delete, Req, Res,UseGuards} from '@nestjs/common';
import {AddressService} from './address.service';
import {Request, Response} from "express";
import {AuthGuard} from "../../auth/guards/auth/auth.guard";

@Controller('user/address')
export class AddressController {
    constructor(private readonly addressService: AddressService) {
    }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.create(req);
        return res.status(result.statusCode).json(result)
    }
    @Patch(':id')
    @UseGuards(AuthGuard)
    async update(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.update(req);
        return res.status(result.statusCode).json(result)
    }
    @Get()
    @UseGuards(AuthGuard)
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
    @UseGuards(AuthGuard)
    async remove(@Req() req: Request, @Res() res: Response) {
        const result = await this.addressService.remove(req);
        return res.status(result.statusCode).json(result)
    }
}
