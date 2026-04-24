export interface UploadUrlParams {
    key: string;
    mimeType: string;
    maxSizeBytes: number;
    expiresInSeconds?: number;
}

export interface UploadUrlResult {
    url: string;
    method: 'PUT';
    headers: Record<string, string>;
    expiresAt: Date;
    bucket: string;
    key: string;
}

export interface StorageService {
    generateUploadUrl(params: UploadUrlParams): Promise<UploadUrlResult>;
    generateDownloadUrl(key: string, expiresInSeconds?: number): Promise<{ url: string; expiresAt: Date }>;
    deleteObject(key: string): Promise<void>;
    buildObjectKey(parts: string[]): string;
    getBucket(): string;
}
