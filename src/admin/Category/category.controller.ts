import {Controller,Post,Get,Put,Delete,Param,Body,UploadedFile,UseInterceptors,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from '../Category/category.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { multerConfig } from '../../utils/multer-config';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body('name') name: string,
    @Body('description') description?: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      const imagePath = image ? `/uploads/${image.filename}` : null;
      const category = await this.categoryService.create(
        name,
        description,
        imagePath,
      );
      return successResponse(201, 'Category created successfully', category);
    } catch (error) {
      return errorResponse(400, 'Failed to create category', error.message);
    }
  }

  @Get()
  async findAll() {
    try {
      const categories = await this.categoryService.findAll();
      return successResponse(
        200,
        'Categories retrieved successfully',
        categories,
      );
    } catch (error) {
      return errorResponse(500, 'Failed to retrieve categories', error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const category = await this.categoryService.findById(id);
      return successResponse(200, 'Category retrieved successfully', category);
    } catch (error) {
      return errorResponse(404, 'Category not found', error.message);
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description?: string,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      const imagePath = image ? `/uploads/${image.filename}` : null;
      const updatedCategory = await this.categoryService.update(
        id,
        name,
        description,
        imagePath,
      );
      return successResponse(
        200,
        'Category updated successfully',
        updatedCategory,
      );
    } catch (error) {
      return errorResponse(400, 'Failed to update category', error.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.categoryService.delete(id);
      return successResponse(200, 'Category deleted successfully');
    } catch (error) {
      return errorResponse(404, 'Failed to delete category', error.message);
    }
  }
}
