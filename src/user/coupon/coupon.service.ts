import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from '../../models/coupon.model';
import { errorResponse, successResponse } from '../../utils/response.util'; 


@Injectable()
export class UserCouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {}

  async getAll() {
    const coupons = await this.couponModel.find({ deleted_at: null, isActive: true  }).exec();
    return successResponse(200, 'Coupons retrieved successfully', coupons);
  }
  
  async getOne(id: string) {
    const coupon = await this.couponModel.findOne({ id, deletedAt: null }).exec();
    if (!coupon) {
      return errorResponse(404, 'Coupon not found');
    }
    return successResponse(200, 'Coupon retrieved successfully', coupon);
  }
}
