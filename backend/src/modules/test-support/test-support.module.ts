import { Module } from '@nestjs/common';
import { TestSupportController } from './test-support.controller';
import { EmailModule } from '../email/email.module';

/**
 * Dev/test support module.
 * Imports EmailModule to reuse the shared LastResetLinkStore singleton.
 * This module MUST be imported into AppModule only when NODE_ENV !== 'production'.
 */
@Module({
  imports: [EmailModule],
  controllers: [TestSupportController],
})
export class TestSupportModule {}
