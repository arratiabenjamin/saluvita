import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_SENDER } from './email.types';
import { LogEmailAdapter } from './adapters/log-email.adapter';
import { ResendEmailAdapter } from './adapters/resend-email.adapter';
import { LastResetLinkStore } from './last-reset-link.store';
import { RecordingEmailAdapter } from './recording-email.adapter';

const IS_DEV = process.env.NODE_ENV !== 'production';

@Module({
  imports: [ConfigModule],
  providers: [
    // Always provide the store so it can be injected; in production it holds no data
    // because the RecordingEmailAdapter is never wired, but TestSupportModule won't be
    // loaded either. Providing it here avoids a circular-dep with TestSupportModule.
    LastResetLinkStore,
    {
      provide: EMAIL_SENDER,
      inject: [ConfigService, LastResetLinkStore],
      useFactory: (configService: ConfigService, store: LastResetLinkStore) => {
        const provider = configService.get<string>('EMAIL_PROVIDER') ?? 'log';
        const base =
          provider === 'resend' ? new ResendEmailAdapter(configService) : new LogEmailAdapter();

        // Wrap with RecordingEmailAdapter only in non-production environments
        return IS_DEV ? new RecordingEmailAdapter(base, store) : base;
      },
    },
  ],
  exports: [EMAIL_SENDER, LastResetLinkStore],
})
export class EmailModule {}
