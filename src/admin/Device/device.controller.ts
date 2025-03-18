import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    UploadedFiles,
    UseInterceptors, Req, Res,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { S3Service } from '../../s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

@Controller('devices')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly s3Service: S3Service,
    ) {
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 10))
    async create(
        @Body() body: any,
        @UploadedFiles() images?: Express.MulterS3.File[],
    ) {
        try {
            const { name, description, categories_id } = body;
            const fileUrls = await this.s3Service.uploadMultipleFiles(images, "devices");
            const device = await this.deviceService.create(name, description, categories_id, fileUrls);
            console.log(device);
            return successResponse(201, 'Device created successfully');
        } catch (error) {
            console.log(error);
            return errorResponse(500, 'Failed to create device', error.message);
        }
    }

    @Get()
    async findAll() {
        try {
            const devices = await this.deviceService.findAll();
            return successResponse(200, 'Devices retrieved successfully', devices);
        } catch (error) {
            return errorResponse(500, 'Failed to retrieve devices', error.message);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const device = await this.deviceService.findOne(id);
            return successResponse(200, 'Device retrieved successfully', device);
        } catch (error) {
            return errorResponse(404, 'Device not found', error.message);
        }
    }

    @Get('category/:categoryId')
    async getDevicesByCategory(@Req() req: Request, @Res() res: Response) {
        const result = await this.deviceService.findByCategory(req);
        return res.status(result.statusCode).json(result);
    }

    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images', 10))
    async update(
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFiles() images?: Express.MulterS3.File[],
    ) {
        try {
            const { name, description, categories_id } = body;
            const fileUrls = await this.s3Service.uploadMultipleFiles(images, "devices");
            const updatedDevice = await this.deviceService.update(id, name, description, categories_id, fileUrls);
            return successResponse(200, 'Device updated successfully', updatedDevice);
        } catch (error) {
            return errorResponse(400, 'Failed to update device', error.message);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        try {
            await this.deviceService.delete(id);
            return successResponse(200, 'Device deleted successfully');
        } catch (error) {
            return errorResponse(404, 'Failed to delete device', error.message);
        }
    }
}
