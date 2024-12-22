import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon } from '../../models/coupon.model';
import { errorResponse, successResponse } from '../../utils/response.util'; 

@Injectable()
export class AdminCouponService {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {}

  async create(data: any) {
    const newCoupon = await this.couponModel.create(data);
    return successResponse(201, 'Coupon created successfully', newCoupon);
  }

  async getAll() {
    const coupons = await this.couponModel.find({ deleted_at: null }).exec();
    return successResponse(200, 'Coupons retrieved successfully', coupons);
  }

  async getOne(id: string) {
    const coupon = await this.couponModel.findOne({ id }).exec();
    if (!coupon) {
      return errorResponse(404, 'Coupon not found');
    }
    return successResponse(200, 'Coupon retrieved successfully', coupon);
  }

  async update(id: string, data: any) {
    const updatedCoupon = await this.couponModel.findOneAndUpdate(
      { id: id },  
      { ...data },
      { new: true }, 
    );
    if (!updatedCoupon) {
      return errorResponse(404, 'Coupon not found');
    }
    return successResponse(200, 'Coupon updated successfully');
  }
  
  async remove(id: string) {
    const deletecoupon = await this.couponModel.findOneAndUpdate(
      { id: id },
      { deleted_at: new Date(), isActive: false },
      { new: true, fields: { deleted_at: 1 } }
    );
    if (!deletecoupon) {
        return errorResponse(404, 'Coupon not found');
    }
    return successResponse(200, 'Coupon deleted successfully');
  }
}
