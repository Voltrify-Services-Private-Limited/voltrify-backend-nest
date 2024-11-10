import {Controller, Post, Body, Res, Req} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from '../../models/user.model'
import { Response, Request } from 'express';

@Controller('auth/user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post('register')
    async create(@Body() userData: Partial<User>, @Res() res: Response) {
        const result = await this.userService.create(userData);
        return res.status(result.statusCode).json(result)
    }

    @Post('generate-token')
    async loginOrGenerateToken(@Req() req: Request, @Res() res: Response){
        const result = await this.userService.loginOrGenerateToken(req)
        return res.status(result.statusCode).json(result)
    }

    @Post('renew-token')
    async renewAccessToken(@Req() req: Request, @Res() res: Response){
        const result = await this.userService.renewAccessToken(req)
        return res.status(result.statusCode).json(result)
    }
}