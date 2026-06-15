import { ConflictException } from '@nestjs/common';
import { CreateDependentUseCase } from './create-dependent.use-case';
import { PatientGuardianRepository } from '../ports/patient-guardian.repository';
import { ActorContext } from '../ports/actor-context';
import {
  DependentDocumentAlreadyExistsError,
  EmailAlreadyInUseError,
} from '../../domain/errors/caregiving-domain.errors';

function makeActor(): ActorContext {
  return { userId: 'guardian-1', email: 'guardian@test.com', roles: ['PATIENT'] };
}

function makeCommand() {
  return {
    email: 'dependent@test.com',
    password: 'SecurePass1!',
    firstName: 'Ana',
    lastName: 'García',
    documentType: 'DNI',
    documentNumber: '12345678A',
    canEditProfile: true,
    canManageAppointments: true,
  };
}

function makeSut() {
  const repo: jest.Mocked<PatientGuardianRepository> = {
    findById: jest.fn(),
    findByInvitationToken: jest.fn(),
    findActiveByPatientAndGuardian: jest.fn(),
    findAnyByPatientAndGuardian: jest.fn(),
    createDependent: jest.fn().mockResolvedValue({
      userId: 'new-user-1',
      patientId: 'new-patient-1',
      guardianLinkId: 'link-1',
    }),
    createInvitation: jest.fn(),
    refreshInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn(),
    updatePermissions: jest.fn(),
    revoke: jest.fn(),
  };

  const sut = new CreateDependentUseCase(repo);
  return { sut, repo };
}

describe('CreateDependentUseCase', () => {
  it('happy path: creates dependent and returns ids', async () => {
    const { sut, repo } = makeSut();

    const result = await sut.execute(makeCommand(), makeActor());

    expect(repo.createDependent).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      userId: 'new-user-1',
      patientId: 'new-patient-1',
      guardianLinkId: 'link-1',
    });
  });

  it('conflict: throws ConflictException when email is already in use', async () => {
    const { sut, repo } = makeSut();
    repo.createDependent.mockRejectedValueOnce(new EmailAlreadyInUseError());

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(ConflictException);
  });

  it('conflict: throws ConflictException when document already exists', async () => {
    const { sut, repo } = makeSut();
    repo.createDependent.mockRejectedValueOnce(new DependentDocumentAlreadyExistsError());

    await expect(sut.execute(makeCommand(), makeActor())).rejects.toBeInstanceOf(ConflictException);
  });
});
