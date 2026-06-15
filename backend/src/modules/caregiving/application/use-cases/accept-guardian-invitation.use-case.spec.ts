import { ForbiddenException, GoneException, NotFoundException } from '@nestjs/common';
import { AcceptGuardianInvitationUseCase } from './accept-guardian-invitation.use-case';
import { PatientGuardianRepository } from '../ports/patient-guardian.repository';
import { ActorContext } from '../ports/actor-context';
import { PatientGuardian } from '../../domain/entities/patient-guardian.entity';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

// NOTE: AcceptGuardianInvitationUseCase injects PrismaService to ensure the caregiver role
// exists after accepting — an infra concern leaking into the application layer.
// We mock PrismaService to prevent DB access in unit tests.
function makePrisma() {
  return {
    role: {
      upsert: jest.fn().mockResolvedValue({ id: 'role-caregiver' }),
    } as any,
    userRole: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(undefined),
    } as any,
  };
}

function makePendingInvitation(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-user-1',
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

function makeAcceptedInvitation(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-user-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: true,
    createdByUserId: 'patient-user-1',
    invitationToken: 'token-abc',
    acceptedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return { userId: 'patient-user-1', email: 'patient@test.com', roles: ['PATIENT'], patientId: 'patient-1', ...overrides };
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
    acceptInvitation: jest.fn().mockResolvedValue(makeAcceptedInvitation()),
    rejectInvitation: jest.fn(),
    updatePermissions: jest.fn(),
    revoke: jest.fn(),
  };

  const prisma = makePrisma();
  const sut = new AcceptGuardianInvitationUseCase(repo, prisma as unknown as PrismaService);
  return { sut, repo, prisma };
}

describe('AcceptGuardianInvitationUseCase', () => {
  it('happy path: accepts invitation and returns guardianLinkId', async () => {
    const { sut, repo } = makeSut();
    repo.findByInvitationToken.mockResolvedValueOnce(makePendingInvitation());

    const result = await sut.execute('token-abc', makeActor());

    expect(repo.acceptInvitation).toHaveBeenCalledWith('link-1');
    expect(result).toHaveProperty('guardianLinkId', 'link-1');
  });

  it('not found: throws NotFoundException when token does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findByInvitationToken.mockResolvedValueOnce(null);

    await expect(sut.execute('bad-token', makeActor())).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.acceptInvitation).not.toHaveBeenCalled();
  });

  it('gone: throws GoneException when invitation is expired', async () => {
    const { sut, repo } = makeSut();
    const expired = PatientGuardian.rehydrate({
      id: 'link-2',
      patientId: 'patient-1',
      guardianUserId: 'guardian-user-1',
      canEditProfile: true,
      canManageAppointments: true,
      isActive: false,
      createdByUserId: 'patient-user-1',
      invitationToken: 'token-expired',
      invitationExpiresAt: new Date(Date.now() - 1000), // already expired
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.findByInvitationToken.mockResolvedValueOnce(expired);

    await expect(sut.execute('token-expired', makeActor())).rejects.toBeInstanceOf(GoneException);
    expect(repo.acceptInvitation).not.toHaveBeenCalled();
  });

  it('forbidden: throws ForbiddenException when actor is not the target patient', async () => {
    const { sut, repo } = makeSut();
    repo.findByInvitationToken.mockResolvedValueOnce(makePendingInvitation());
    const wrongActor = makeActor({ patientId: 'wrong-patient' });

    await expect(sut.execute('token-abc', wrongActor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.acceptInvitation).not.toHaveBeenCalled();
  });

  it('forbidden: throws ForbiddenException when actor has no patientId', async () => {
    const { sut, repo } = makeSut();
    repo.findByInvitationToken.mockResolvedValueOnce(makePendingInvitation());
    const actorNoPatient = makeActor({ patientId: undefined });

    await expect(sut.execute('token-abc', actorNoPatient)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
