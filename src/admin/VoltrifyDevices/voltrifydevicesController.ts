import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { VoltrifyDevicesService } from './voltrifydevices.service';

@Controller('voltrifydevices')
export class VoltrifyDevicesController {
  constructor(private readonly voltrifyDevicesService: VoltrifyDevicesService) {}
  
  @Get()
  async getAllDevices() {
    const response = await this.voltrifyDevicesService.getDevices(); 
    return {
      statusCode: 200,
      message: response.data.length ? 'Devices found' : 'No devices found',
      data: response.data,
    };
  }
  

  @Get(':deviceId')
  async getDeviceById(@Param('deviceId') deviceId: string) {
    try {
      const device = await this.voltrifyDevicesService.getDeviceById(deviceId);
      return {
        statusCode: 200,
        message: 'Device found',
        data: device,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: 404,
          message: error.message,
        };
      }
      throw error;
    }
  }

  @Post()
  async createDevice(@Body('deviceId') deviceId: string) {
    const newDevice = await this.voltrifyDevicesService.createDevice(deviceId);
    return {
      statusCode: 201,
      message: 'Device created successfully',
      data: newDevice,
    };
  }

  @Delete(':deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    const result = await this.voltrifyDevicesService.deleteDevice(deviceId);
    return {
      statusCode: 200,
      message: result.deletedCount ? 'Device deleted successfully' : 'Device not found',
    };
  }
}
