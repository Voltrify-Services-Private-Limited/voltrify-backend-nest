import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from '../models/card.model'
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { User, UserSchema } from "../models/user.model";
import { Admin, AdminSchema } from "../models/admin.model";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class cardModule {
}