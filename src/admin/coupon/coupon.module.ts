import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../../models/coupon.model';
import { AdminCouponController } from '../coupon/coupon.controller';
import { AdminCouponService } from '../coupon/coupon.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [AdminCouponController],
  providers: [AdminCouponService],
})
export class AdminModule {}
