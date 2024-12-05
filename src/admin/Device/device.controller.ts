import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { DeviceService } from '../Device/device.service';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(@Body() body: any) {
    const { name, description, categories_id } = body;
    return this.deviceService.create(name, description, categories_id);
  }

  @Get()
  async findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const { name, description, categories_id } = body;
    return this.deviceService.update(id, name, description, categories_id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deviceService.delete(id);
  }
}
