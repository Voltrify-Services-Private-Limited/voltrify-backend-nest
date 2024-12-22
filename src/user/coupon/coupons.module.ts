import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../../models/coupon.model';
import { UserCouponController } from '../coupon/coupon.controller';
import { UserCouponService } from '../coupon/coupon.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [UserCouponController],
  providers: [UserCouponService],
})
export class CouponsModule {}
