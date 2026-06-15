import { Injectable } from '@nestjs/common';

export interface ResetLinkEntry {
  to: string;
  resetLink: string;
  capturedAt: Date;
}

@Injectable()
export class LastResetLinkStore {
  private entry: ResetLinkEntry | null = null;

  set(to: string, resetLink: string): void {
    this.entry = { to, resetLink, capturedAt: new Date() };
  }

  get(): ResetLinkEntry | null {
    return this.entry;
  }

  clear(): void {
    this.entry = null;
  }
}
