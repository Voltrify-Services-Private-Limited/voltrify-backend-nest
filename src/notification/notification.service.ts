import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SNSClient, PublishCommand} from '@aws-sdk/client-sns';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationService {
    private snsClient: SNSClient;
    private twilioClient: Twilio;

    constructor(private configService: ConfigService) {
        this.snsClient = new SNSClient({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });

        this.twilioClient = new Twilio(
            this.configService.get<string>('TWILIO_ACCOUNT_SID'),
            this.configService.get<string>('TWILIO_AUTH_TOKEN')
        );
    }


    async sendSMSByAwsSns(phoneNumber: string, message: string) {
        try {
            const params = {
                PhoneNumber: "+91" + phoneNumber,
                Message: message,
            };
            const command = new PublishCommand(params);
            await this.snsClient.send(command);
            console.log('SMS sent successfully');
        } catch (error) {
            console.error('Failed to send SMS:', error);
            throw error;
        }
    }

    async sendSMS(to: string, message: string) {
        try {
            const sms = await this.twilioClient.messages.create({
                body: message,
                from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
                to: "+91" + to,
            })
            return {
                status: 200,
                message: 'SMS sent successfully',
                data: sms,
            };
        } catch (error) {
            console.error('Error sending SMS:', error);
            return {
                status: 500,
                message: 'Failed to send SMS1',
                error: error.message,
            };
        }
    }
}
