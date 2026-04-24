import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3StorageService } from "./infrastructure/s3-storage.service";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        { provide: 'StorageService', useClass: S3StorageService },
        S3StorageService,
    ],
    exports: ['StorageService', S3StorageService],
})
export class StorageModule {}
