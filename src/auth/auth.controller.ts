import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {AuthService} from './auth.service';
import {User} from '../user/user.model'
import {successResponse} from "../utils/response.util";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async create(@Body() userData: Partial<User>) {
        const result = await this.authService.create(userData);
        return {
            "status": 201,
            "message": "User created",
            "data": result
        }
    }

}
