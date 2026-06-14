import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_SENDER } from './email.types';
import { LogEmailAdapter } from './adapters/log-email.adapter';
import { ResendEmailAdapter } from './adapters/resend-email.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SENDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('EMAIL_PROVIDER') ?? 'log';
        if (provider === 'resend') {
          return new ResendEmailAdapter(configService);
        }
        return new LogEmailAdapter();
      },
    },
  ],
  exports: [EMAIL_SENDER],
})
export class EmailModule {}
