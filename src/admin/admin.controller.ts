import {Controller, Get, Post, Body, Patch, Param, Delete, Req, Res} from '@nestjs/common';
import {AdminService} from './admin.service';
import {Request, Response} from "express";

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
    }

}
