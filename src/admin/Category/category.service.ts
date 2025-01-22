import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../models/category.model';
import { S3Service } from '../../s3.service';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<Category>,
        private readonly s3Service: S3Service
    ) {
    }

    async create(name: string, description?: string, image?: string): Promise<Category> {
        const newCategory = new this.categoryModel({ name, description, image });
        return newCategory.save();
    }

    async findAll(): Promise<Category[]> {
        const categories = await this.categoryModel
            .find()
            .select('-_id')
            .exec();
        if (!categories) throw new NotFoundException('Categories not found');
        for (const category of categories) {
            category.image = await this.s3Service.getPresignedUrl(category.image);
        }
        return categories;
    }

    async findById(id: string): Promise<Category> {
        const category = await this.categoryModel
            .findOne({ id })
            .select('-_id')
            .exec();
        if (!category) throw new NotFoundException('Category not found');
        category.image = await this.s3Service.getPresignedUrl(category.image);
        return category;
    }

    async update(id: string, name: string, description?: string, image?: string): Promise<Category> {
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
