import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res} from '@nestjs/common';
import {AdminService} from './admin.service';
import {Request, Response} from "express";

@Controller('auth/admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
    }

    @Post("register")
    async addNewAdmin(@Req() req: Request, @Res() res: Response) {
        const result = await this.adminService.addNewAdmin(req)
        return res.status(result.statusCode).json(result)
    }

    @Post('generate-token')
    async loginOrGenerateToken(@Req() req: Request, @Res() res: Response){
        const result = await this.adminService.loginOrGenerateToken(req)
        return res.status(result.statusCode).json(result)
    }

    @Post('renew-token')
    async renewAccessToken(@Req() req: Request, @Res() res: Response){
        const result = await this.adminService.renewAccessToken(req)
        return res.status(result.statusCode).json(result)
    }
}
