import { PatientGuardian } from './patient-guardian.entity';

function makeBaseProps() {
  return {
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: false,
    createdByUserId: 'user-1',
    invitationToken: 'token-abc',
    invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('PatientGuardian entity — rehydrate', () => {
  it('rehydrates and exposes all props', () => {
    const pg = PatientGuardian.rehydrate(makeBaseProps());

    expect(pg.id).toBe('link-1');
    expect(pg.patientId).toBe('patient-1');
    expect(pg.guardianUserId).toBe('guardian-1');
    expect(pg.canEditProfile).toBe(true);
    expect(pg.canManageAppointments).toBe(true);
    expect(pg.isActive).toBe(false);
    expect(pg.createdByUserId).toBe('user-1');
    expect(pg.invitationToken).toBe('token-abc');
    expect(pg.invitationExpiresAt).toBeDefined();
  });

  it('rehydrates with optional relationship', () => {
    const pg = PatientGuardian.rehydrate({ ...makeBaseProps(), relationship: 'parent' });
    expect(pg.relationship).toBe('parent');
  });
});

describe('PatientGuardian entity — status', () => {
  it('returns PENDING when not active, not rejected, not revoked, with token', () => {
    const pg = PatientGuardian.rehydrate(makeBaseProps());
    expect(pg.status).toBe('PENDING');
    expect(pg.isPending()).toBe(true);
  });

  it('returns ACTIVE when isActive is true', () => {
    const pg = PatientGuardian.rehydrate({ ...makeBaseProps(), isActive: true, invitationToken: undefined });
    expect(pg.status).toBe('ACTIVE');
    expect(pg.isPending()).toBe(false);
  });

  it('returns REJECTED when rejectedAt is set', () => {
    const pg = PatientGuardian.rehydrate({
      ...makeBaseProps(),
      isActive: false,
      invitationToken: undefined,
      rejectedAt: new Date(),
    });
    expect(pg.status).toBe('REJECTED');
    expect(pg.isPending()).toBe(false);
  });

  it('returns REVOKED when revokedAt is set', () => {
    const pg = PatientGuardian.rehydrate({
      ...makeBaseProps(),
      isActive: false,
      invitationToken: undefined,
      revokedAt: new Date(),
    });
    expect(pg.status).toBe('REVOKED');
    expect(pg.isPending()).toBe(false);
  });

  it('isPending returns false when token is missing', () => {
    const pg = PatientGuardian.rehydrate({
      ...makeBaseProps(),
      invitationToken: undefined,
    });
    expect(pg.isPending()).toBe(false);
  });
});

describe('PatientGuardian entity — isExpired', () => {
  it('returns false when no expiration date', () => {
    const pg = PatientGuardian.rehydrate({ ...makeBaseProps(), invitationExpiresAt: undefined });
    expect(pg.isExpired()).toBe(false);
  });

  it('returns false when expiration is in the future', () => {
    const pg = PatientGuardian.rehydrate({
      ...makeBaseProps(),
      invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    expect(pg.isExpired()).toBe(false);
  });

  it('returns true when expiration is in the past', () => {
    const pg = PatientGuardian.rehydrate({
      ...makeBaseProps(),
      invitationExpiresAt: new Date(Date.now() - 1000),
    });
    expect(pg.isExpired()).toBe(true);
  });

  it('accepts a custom "now" date for testability', () => {
    const expiresAt = new Date('2026-07-01');
    const pg = PatientGuardian.rehydrate({ ...makeBaseProps(), invitationExpiresAt: expiresAt });

    expect(pg.isExpired(new Date('2026-08-01'))).toBe(true);
    expect(pg.isExpired(new Date('2026-06-01'))).toBe(false);
  });
});
