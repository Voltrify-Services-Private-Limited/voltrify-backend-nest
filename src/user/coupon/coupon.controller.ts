import { Controller, Get, Param , Req, Res,Body} from '@nestjs/common';
import { UserCouponService } from '../coupon/coupon.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { Request, Response } from 'express';

@Controller('user/coupons')
export class UserCouponController {
  constructor(private readonly userCouponService: UserCouponService) {}

  @Get()
  async getAll(@Res() res: Response) {
    const coupons = await this.userCouponService.getAll();
    return res.status(200).json(successResponse(200, 'Coupons retrieved successfully', coupons));
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Res() res: Response) {
    const coupon = await this.userCouponService.getOne(id);
    return res.status(200).json(successResponse(200, 'Coupon retrieved successfully', coupon));
  }
}
