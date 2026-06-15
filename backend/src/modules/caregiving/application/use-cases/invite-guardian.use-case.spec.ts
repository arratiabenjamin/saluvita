import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InviteGuardianUseCase } from './invite-guardian.use-case';
import { PatientGuardianRepository } from '../ports/patient-guardian.repository';
import { ActorContext } from '../ports/actor-context';
import { PatientGuardian } from '../../domain/entities/patient-guardian.entity';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// NOTE: InviteGuardianUseCase injects PrismaService (to look up the target user by email)
// and ConfigService (to read GUARDIAN_INVITATION_TTL_DAYS) — both are infra concerns in
// the application layer. We mock both to keep tests pure.
function makePrisma(userOverrides?: object | null) {
  const defaultUser = {
    id: 'target-user-1',
    email: 'patient@example.com',
    patientProfile: { id: 'target-patient-1' },
  };
  return {
    user: {
      findFirst: jest.fn().mockResolvedValue(userOverrides === undefined ? defaultUser : userOverrides),
    } as any,
  };
}

function makeConfigService(ttl = '7') {
  return {
    get: jest.fn().mockReturnValue(ttl),
  } as unknown as ConfigService;
}

function makePendingLink(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'target-patient-1',
    guardianUserId: 'actor-user-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: false,
    createdByUserId: 'actor-user-1',
    invitationToken: 'old-token',
    invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeActor(): ActorContext {
  return { userId: 'actor-user-1', email: 'actor@test.com', roles: ['PATIENT'], patientId: 'actor-patient-1' };
}

function makeCommand() {
  return {
    targetPatientEmail: 'patient@example.com',
    relationship: 'parent',
    canEditProfile: true,
    canManageAppointments: true,
  };
}

function makeSut(userOverrides?: object | null) {
  const repo: jest.Mocked<PatientGuardianRepository> = {
    findById: jest.fn(),
    findByInvitationToken: jest.fn(),
    findActiveByPatientAndGuardian: jest.fn(),
    findAnyByPatientAndGuardian: jest.fn().mockResolvedValue(null),
    createDependent: jest.fn(),
    createInvitation: jest.fn().mockResolvedValue(
      PatientGuardian.rehydrate({
        id: 'link-new',
        patientId: 'target-patient-1',
        guardianUserId: 'actor-user-1',
        canEditProfile: true,
        canManageAppointments: true,
        isActive: false,
        createdByUserId: 'actor-user-1',
        invitationToken: 'new-token',
        invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    refreshInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn(),
    updatePermissions: jest.fn(),
    revoke: jest.fn(),
  };

  const prisma = makePrisma(userOverrides);
  const config = makeConfigService();
  const sut = new InviteGuardianUseCase(repo, prisma as unknown as PrismaService, config);
  return { sut, repo, prisma, config };
}

describe('InviteGuardianUseCase', () => {
  it('happy path: creates invitation and returns token data', async () => {
    const { sut, repo } = makeSut();

    const result = await sut.execute(makeCommand(), makeActor());

    expect(repo.createInvitation).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('guardianLinkId');
    expect(result).toHaveProperty('invitationToken');
    expect(result).toHaveProperty('invitationExpiresAt');
    expect(result).toHaveProperty('targetPatientId', 'target-patient-1');
  });

  it('happy path: refreshes invitation when pending link already exists', async () => {
    const { sut, repo } = makeSut();
    const existingPending = makePendingLink();
    repo.findAnyByPatientAndGuardian.mockResolvedValueOnce(existingPending);
    repo.refreshInvitation.mockResolvedValueOnce(
      PatientGuardian.rehydrate({
        ...existingPending as any,
        invitationToken: 'refreshed-token',
      }),
    );

    const result = await sut.execute(makeCommand(), makeActor());

    expect(repo.refreshInvitation).toHaveBeenCalledTimes(1);
    expect(repo.createInvitation).not.toHaveBeenCalled();
    expect(result).toHaveProperty('invitationToken', 'refreshed-token');
  });

  it('not found: throws NotFoundException when target user does not exist', async () => {
    const { sut } = makeSut(null);

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('conflict: throws ConflictException when target user has no patient profile', async () => {
    const { sut } = makeSut({ id: 'target-user-1', email: 'patient@example.com', patientProfile: null });

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbidden: throws ForbiddenException when actor invites themselves', async () => {
    const { sut } = makeSut({ id: 'actor-user-1', email: 'patient@example.com', patientProfile: { id: 'target-patient-1' } });

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('conflict: throws ConflictException when active guardian link already exists', async () => {
    const { sut, repo } = makeSut();
    const activeLink = PatientGuardian.rehydrate({
      id: 'link-active',
      patientId: 'target-patient-1',
      guardianUserId: 'actor-user-1',
      canEditProfile: true,
      canManageAppointments: true,
      isActive: true, // <-- active link
      createdByUserId: 'actor-user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.findAnyByPatientAndGuardian.mockResolvedValueOnce(activeLink);

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(ConflictException);
  });
});
