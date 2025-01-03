import {Module} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {OtpModule} from './otp/otp.module';
import {NotificationModule} from './notification/notification.module';
import * as process from "node:process";
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        UserModule,
        AuthModule,
        OtpModule,
        NotificationModule,
        AdminModule,
        PaymentModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
