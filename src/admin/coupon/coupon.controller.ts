import { Controller, Post, Get, Param, Body, Patch, Delete, Req, Res} from '@nestjs/common';
import { AdminCouponService } from '../coupon/coupon.service';
import { Request, Response } from 'express';
import { calculateDiscountedPrice } from '../../utils/discount.utils';
import { successResponse, errorResponse } from '../../utils/response.util';

@Controller('admin/coupons')
export class AdminCouponController {
  constructor(private readonly adminCouponService: AdminCouponService) { }
  @Post()
  async create(@Req() req: Request, @Res() res: Response) {
    const { originalPrice, discount, discountType, code, name, description } = req.body;
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount, discountType);
    const couponData = {
      code,
      name,
      description,
      discount,
      discountType,
      originalPrice,
      discountedPrice,
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
    };
    const coupon = await this.adminCouponService.create(couponData);
    return res.status(201).json(successResponse(201, 'Coupon created successfully'));
  }

  @Get()
  async getAll(@Res() res: Response) {
    const coupons = await this.adminCouponService.getAll();
    return res.status(200).json(successResponse(200, 'Coupons retrieved successfully', coupons));
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: Response) {
    const coupon = await this.adminCouponService.getOne(id);
    return res.status(200).json(successResponse(200, 'Coupon retrieved successfully', coupon));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const updatedCoupon = await this.adminCouponService.update(id, req.body);
    return res.status(200).json(successResponse(200, 'Coupon updated successfully', updatedCoupon));
  }
  
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const result = await this.adminCouponService.remove(id);
    return res.status(result.statusCode).json(result);
  }
}
