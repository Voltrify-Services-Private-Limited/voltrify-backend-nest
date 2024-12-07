import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../models/category.model';


@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(
    name: string,
    description?: string,
    image?: string,
  ): Promise<Category> {
    const newCategory = new this.categoryModel({ name, description, image });
    return newCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ id }).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(
    id: string,
    name: string,
    description?: string,
    image?: string,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findOneAndUpdate({ id }, { name, description, image }, { new: true })
      .exec();
    if (!updatedCategory) throw new NotFoundException('Category not found');
    return updatedCategory;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Category not found');
  }
}
