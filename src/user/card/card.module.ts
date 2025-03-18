import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from '../../models/card.model'
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { User, UserSchema } from "../../models/user.model"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class cardModule {
}