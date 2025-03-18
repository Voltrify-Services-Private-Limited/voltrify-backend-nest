import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import * as process from 'node:process';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
                secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
            },
        });
        this.bucketName = `${process.env.AWS_S3_BUCKET_NAME}-${process.env.ENV}`;
    }

    async uploadFile(file: Express.Multer.File, dir: string): Promise<string> {
        const fileKey = `${dir}/${Date.now()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        return `${fileKey}`;
    }

    async uploadMultipleFiles(files: Express.Multer.File[], dir: string): Promise<string[]> {
        const uploadPromises = files.map((file) => this.uploadFile(file, dir));
        return await Promise.all(uploadPromises);
    }

    async getPresignedUrl(fileKey: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
        });

        // Generate a pre-signed URL valid for 60 minutes
        const signedUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: 3600, // 1 hour in seconds
        });

        return signedUrl;
    }
}
