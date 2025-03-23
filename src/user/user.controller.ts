import {Controller, Get, Patch, Delete, Req, Res, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import { Response, Request } from 'express';
import {AuthGuard} from "../auth/guards/auth/auth.guard";

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Get()
    @UseGuards(AuthGuard)
    async getUser(@Req() req: Request, @Res() res: Response){
        const result = await this.userService.get(req)
        return res.status(result.statusCode).json(result)
    }
    @Patch()
    @UseGuards(AuthGuard)
    async updateUser(@Req() req: Request, @Res() res: Response){
        const result = await this.userService.update(req)
        return res.status(result.statusCode).json(result)
    }
    @Delete()
    @UseGuards(AuthGuard)
    async deleteMyAccount(@Req() req: Request, @Res() res: Response){
        const result = await this.userService.deleteMyAccount(req)
        return res.status(result.statusCode).json(result)
    }
}
