import {Controller, Post, Body, Res, Req} from '@nestjs/common';
import {AuthService} from './auth.service';
import {User} from '../models/user.model'
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async create(@Body() userData: Partial<User>, @Res() res: Response) {
        const result = await this.authService.create(userData);
        return res.status(result.statusCode).json(result)
    }

    @Post('generate-token')
    async loginOrGenerateToken(@Req() req: Request, @Res() res: Response){
        const result = await this.authService.loginOrGenerateToken(req)
        return res.status(result.statusCode).json(result)
    }

    @Post('renew-token')
    async renewAccessToken(@Req() req: Request, @Res() res: Response){
        const result = await this.authService.renewAccessToken(req)
        return res.status(result.statusCode).json(result)
    }
}