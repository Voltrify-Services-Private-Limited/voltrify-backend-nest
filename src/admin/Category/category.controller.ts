import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from '../Category/category.service';
import { Category } from '../../models/category.model'


@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body('name') name: string,
    @Body('description') description?: string,
  ): Promise<Category> {
    return this.categoryService.create(name, description);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ): Promise<Category> {
    return this.categoryService.update(id, name, description);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
