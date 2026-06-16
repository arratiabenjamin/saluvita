import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateGuardianPermissionsUseCase } from './update-guardian-permissions.use-case';
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

function makeCommand(overrides = {}) {
  return {
    guardianLinkId: 'link-1',
    canEditProfile: false,
    canManageAppointments: false,
    ...overrides,
  };
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
    updatePermissions: jest.fn().mockResolvedValue(makeLink()),
    revoke: jest.fn(),
  };

  const sut = new UpdateGuardianPermissionsUseCase(repo);
  return { sut, repo };
}

describe('UpdateGuardianPermissionsUseCase', () => {
  it('happy path: patient owner can update permissions', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(makeLink());
    const actor: ActorContext = { userId: 'patient-user-1', email: 'p@test.com', roles: ['PATIENT'], patientId: 'patient-1' };

    const result = await sut.execute(makeCommand(), actor);

    expect(repo.updatePermissions).toHaveBeenCalledWith('link-1', {
      canEditProfile: false,
      canManageAppointments: false,
    });
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('happy path: admin can update any link permissions', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(makeLink());
    const actor: ActorContext = { userId: 'admin-1', email: 'admin@test.com', roles: [ROLE_ADMIN] };

    const result = await sut.execute(makeCommand(), actor);

    expect(repo.updatePermissions).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('guardianLinkId');
  });

  it('not found: throws NotFoundException when link does not exist', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(null);
    const actor: ActorContext = { userId: 'admin-1', email: 'admin@test.com', roles: [ROLE_ADMIN] };

    await expect(sut.execute(makeCommand(), actor)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbidden: throws ForbiddenException for unrelated patient', async () => {
    const { sut, repo } = makeSut();
    repo.findById.mockResolvedValueOnce(makeLink());
    const actor: ActorContext = { userId: 'other-user', email: 'o@test.com', roles: ['PATIENT'], patientId: 'other-patient' };

    await expect(sut.execute(makeCommand(), actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.updatePermissions).not.toHaveBeenCalled();
  });
});
