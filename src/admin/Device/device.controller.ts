import { Controller, Post, Body, Get, Param, Patch, Delete, UploadedFiles, UseInterceptors, } from '@nestjs/common';
import { DeviceService } from '../Device/device.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../utils/multer-config';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  async create(
    @Body() body: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    try {
      const { name, description, categories_id } = body;
      const imagePaths = images
        ? images.map((file) => `/uploads/${file.filename}`)
        : [];
      const device = await this.deviceService.create(name, description, categories_id, imagePaths,);
      return successResponse(201, 'Device created successfully');
    } catch (error) {
      return errorResponse(400, 'Failed to create device', error.message);
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

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    try {
      const { name, description, categories_id } = body;
      const imagePaths = images
        ? images.map((file) => `/uploads/${file.filename}`)
        : [];
      const updatedDevice = await this.deviceService.update(id, name, description, categories_id, imagePaths,);
      return successResponse(200, 'Device updated successfully',updatedDevice);
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
