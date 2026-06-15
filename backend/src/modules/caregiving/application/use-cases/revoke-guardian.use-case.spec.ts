import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RevokeGuardianUseCase } from './revoke-guardian.use-case';
import { PatientGuardianRepository } from '../ports/patient-guardian.repository';
import { ActorContext } from '../ports/actor-context';
import { PatientGuardian } from '../../domain/entities/patient-guardian.entity';
import { ROLE_ADMIN } from '../../../../shared/auth/roles.constants';

function makeLink(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-user-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: true,
    createdByUserId: 'patient-user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeRevokedLink(): PatientGuardian {
  return PatientGuardian.rehydrate({
    id: 'link-1',
    patientId: 'patient-1',
    guardianUserId: 'guardian-user-1',
    canEditProfile: true,
    canManageAppointments: true,
    isActive: false,
    createdByUserId: 'patient-user-1',
    revokedAt: new Date(),
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
    rejectInvitation: jest.fn(),
    updatePermissions: jest.fn(),
    revoke: jest.fn().mockResolvedValue(makeRevokedLink()),
  };

  const sut = new RevokeGuardianUseCase(repo);
  return { sut, repo };
}

describe('RevokeGuardianUseCase', () => {
  it('happy path: patient owner can revoke guardian link', async () => {
    const { sut, repo } = makeSut();
    const link = makeLink();
    repo.findById.mockResolvedValueOnce(link);
    const actor: ActorContext = { userId: 'patient-user-1', email: 'p@test.com', roles: ['PATIENT'], patientId: 'patient-1' };

    const result = await sut.execute('link-1', actor);

    expect(repo.revoke).toHaveBeenCalledWith('link-1');
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('happy path: guardian can self-revoke', async () => {
    const { sut, repo } = makeSut();
    const link = makeLink();
    repo.findById.mockResolvedValueOnce(link);
    const actor: ActorContext = { userId: 'guardian-user-1', email: 'g@test.com', roles: ['PATIENT'] };

    const result = await sut.execute('link-1', actor);

    expect(repo.revoke).toHaveBeenCalledWith('link-1');
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('happy path: admin can revoke any link', async () => {
    const { sut, repo } = makeSut();
    const link = makeLink();
    repo.findById.mockResolvedValueOnce(link);
    const actor: ActorContext = { userId: 'admin-1', email: 'admin@test.com', roles: [ROLE_ADMIN] };

    const result = await sut.execute('link-1', actor);

    expect(repo.revoke).toHaveBeenCalledWith('link-1');
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('not found: throws NotFoundException when link does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(null);
    const actor: ActorContext = { userId: 'admin-1', email: 'admin@test.com', roles: [ROLE_ADMIN] };

    await expect(sut.execute('link-999', actor)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbidden: throws ForbiddenException for unrelated user', async () => {
    const { sut, repo } = makeSut();
    const link = makeLink();
    repo.findById.mockResolvedValueOnce(link);
    const actor: ActorContext = { userId: 'unrelated-1', email: 'u@test.com', roles: ['PATIENT'], patientId: 'other-patient' };

    await expect(sut.execute('link-1', actor)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
