import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageService, UploadUrlParams, UploadUrlResult } from "../application/ports/storage.service";

@Injectable()
export class S3StorageService implements StorageService, OnModuleInit {
    private client!: S3Client;
    private bucket!: string;
    private defaultUploadTtl!: number;
    private defaultDownloadTtl!: number;

    constructor(private readonly configService: ConfigService) {}

    onModuleInit(): void {
        const region = this.configService.get<string>('AWS_REGION') ?? 'us-east-1';
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET') ?? 'agendamedica-uploads';
        this.defaultUploadTtl = Number(this.configService.get<string>('AWS_S3_UPLOAD_URL_TTL_SECONDS') ?? 900);
        this.defaultDownloadTtl = Number(this.configService.get<string>('AWS_S3_DOWNLOAD_URL_TTL_SECONDS') ?? 900);

        this.client = new S3Client({
            region,
            credentials: accessKeyId && secretAccessKey
                ? { accessKeyId, secretAccessKey }
                : undefined,
        });
    }

    getBucket(): string {
        return this.bucket;
    }

    buildObjectKey(parts: string[]): string {
        return parts
            .map((part) => part.replace(/^\/+|\/+$/g, ''))
            .filter(Boolean)
            .join('/');
    }

    async generateUploadUrl(params: UploadUrlParams): Promise<UploadUrlResult> {
        const expiresIn = params.expiresInSeconds ?? this.defaultUploadTtl;
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: params.key,
            ContentType: params.mimeType,
            ContentLength: params.maxSizeBytes,
        });

        const url = await getSignedUrl(this.client, command, { expiresIn });
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        return {
            url,
            method: 'PUT',
            headers: {
                'Content-Type': params.mimeType,
            },
            expiresAt,
            bucket: this.bucket,
            key: params.key,
        };
    }

    async generateDownloadUrl(key: string, expiresInSeconds?: number): Promise<{ url: string; expiresAt: Date }> {
        const expiresIn = expiresInSeconds ?? this.defaultDownloadTtl;
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const url = await getSignedUrl(this.client, command, { expiresIn });
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        return { url, expiresAt };
    }

    async deleteObject(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }
}
