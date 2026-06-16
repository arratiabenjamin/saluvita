import { Controller, Get, NotFoundException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { LastResetLinkStore } from '../email/last-reset-link.store';

/**
 * Dev/test-only controller.
 * Registered ONLY when NODE_ENV !== 'production' (see TestSupportModule).
 * Provides helpers for Playwright e2e tests that need to inspect server-side state
 * without real email infrastructure.
 */
@ApiExcludeController()
@Controller('/v1/auth/test')
export class TestSupportController {
  constructor(private readonly store: LastResetLinkStore) {}

  @Get('last-reset-link')
  getLastResetLink(): { resetLink: string; to: string } {
    const entry = this.store.get();
    if (!entry) {
      throw new NotFoundException('No reset link has been captured yet');
    }
    return { resetLink: entry.resetLink, to: entry.to };
  }
}
