import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RejectGuardianInvitationUseCase } from './reject-guardian-invitation.use-case';
import { PatientGuardianRepository } from '../ports/patient-guardian.repository';
import { ActorContext } from '../ports/actor-context';
import { PatientGuardian } from '../../domain/entities/patient-guardian.entity';

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return { userId: 'patient-user-1', email: 'patient@test.com', roles: ['PATIENT'], patientId: 'patient-1', ...overrides };
}

function makePendingInvitation(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: false,
    createdByUserId: 'patient-user-1',
    invitationToken: 'token-abc',
    invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeSut() {
  const repo: jest.Mocked<PatientGuardianRepository> = {
    findById: jest.fn(),
    findByInvitationToken: jest.fn(),
    findActiveByPatientAndGuardian: jest.fn(),
    findAnyByPatientAndGuardian: jest.fn(),
    createDependent: jest.fn(),
    createInvitation: jest.fn(),
    refreshInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn().mockResolvedValue({ id: 'link-1' }),
    updatePermissions: jest.fn(),
    revoke: jest.fn(),
  };

  const sut = new RejectGuardianInvitationUseCase(repo);
  return { sut, repo };
}

describe('RejectGuardianInvitationUseCase', () => {
  it('happy path: rejects invitation and returns guardianLinkId', async () => {
    const { sut, repo } = makeSut();
    const invitation = makePendingInvitation();
    repo.findByInvitationToken.mockResolvedValueOnce(invitation);
    repo.rejectInvitation.mockResolvedValueOnce(PatientGuardian.rehydrate({
      ...invitation as any,
      rejectedAt: new Date(),
    }));

    const result = await sut.execute('token-abc', makeActor());

    expect(repo.rejectInvitation).toHaveBeenCalledWith('link-1');
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('not found: throws NotFoundException when token does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findByInvitationToken.mockResolvedValueOnce(null);

    await expect(sut.execute('bad-token', makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.rejectInvitation).not.toHaveBeenCalled();
  });

  it('forbidden: throws ForbiddenException when actor is not the target patient', async () => {
    const { sut, repo } = makeSut();
    const invitation = makePendingInvitation();
    repo.findByInvitationToken.mockResolvedValueOnce(invitation);
    const wrongActor = makeActor({ patientId: 'wrong-patient' });

    await expect(sut.execute('token-abc', wrongActor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.rejectInvitation).not.toHaveBeenCalled();
  });
});
