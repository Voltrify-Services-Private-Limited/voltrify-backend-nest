import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from '../category/category.controller';
import { CategoryService } from '../Category/category.service';
import { Category ,CategorySchema} from '../../models/category.model'

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
