import {Injectable} from '@nestjs/common';
import {errorResponse, successResponse} from "../../utils/response.util";
import {Model} from "mongoose";
import {Address} from "../../models/address.model";
import {User} from '../../models/user.model';
import {InjectModel} from "@nestjs/mongoose";
import {Request} from "express";

@Injectable()
export class AddressService {
    constructor(
        @InjectModel(Address.name) private addressModel: Model<Address>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}
    async create(req: Request) {
        const {firstName, lastName, phoneNumber, user_id, addressLine1, addressLine2, landmark, city, state, pincode} = req.body;
        // Now we will check, Is user is registered in db or not
        const user = await this.userModel.findOne({id: user_id})
        if (!user) {
            return errorResponse(404, 'User is not found or not registered')
        }
        
        if (!firstName || !lastName || !phoneNumber || !user_id || !addressLine1 || !city || !state || !pincode) {
            return errorResponse(400, 'Missing required fields');
        }

        const existingAddress = await this.addressModel.findOne({ phoneNumber: phoneNumber });
        if (existingAddress) {
            return errorResponse(400, 'Phone number already exists');
        }

        const address = new this.addressModel({firstName, lastName, phoneNumber, user_id, addressLine1, addressLine2, landmark, city, state, pincode});
    
        await address.save();
        return successResponse(201, "Address added")
    }
    async update(req: any) {
        const {firstName, lastName, phoneNumber, user_id, addressLine1, addressLine2, landmark, city, state, pincode} = req.body;
        const addressId:string = req.params.id
    
        // const userId = req.user.id;
        // if (userId !== user_id) {
        //     return errorResponse(403, 'Not authorized to update this address');
        // }
        const address = await this.addressModel.findOne({ id: addressId });
        if (!address) {
            return errorResponse(404, 'Address not found');
        }
        address.firstName = firstName || address.firstName;
        address.lastName = lastName || address.lastName;
        address.phoneNumber = phoneNumber || address.phoneNumber;
        address.user_id = user_id || address.user_id;
        address.addressLine1 = addressLine1 || address.addressLine1;
        address.addressLine2 = addressLine2 || address.addressLine2;
        address.landmark = landmark || address.landmark;
        address.city = city || address.city;
        address.state = state || address.state;
        address.pincode = pincode || address.pincode;
    
        await address.save();
        return successResponse(201, "Address updated")
    }

    async findAll(req: Request) {
        const userId:string = req.params.id;
        const addresses:any = await this.addressModel.find({user_id: userId})
        return successResponse(200, "All address of user", addresses)
    }

    async findOne(req: Request) {
        const addressId:string = req.params.id;
        const address:any = await this.addressModel.find({id: addressId})
        return successResponse(200, "Address details", address)
    }

    async remove(req: any) {
        const addressId:string = req.params.id;
        // const userId = req.user.id
        // if(userId != req.body.id) {
        //     return errorResponse(403, 'Not authorised')
        // }
        await this.addressModel.findOneAndDelete({id: addressId})
        return successResponse(200, "Address removed")
    }
}
