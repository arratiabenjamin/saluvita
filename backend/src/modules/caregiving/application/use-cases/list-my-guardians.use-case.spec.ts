import { ForbiddenException } from '@nestjs/common';
import { ListMyGuardiansUseCase } from './list-my-guardians.use-case';
import { PatientGuardianQueryService } from '../ports/patient-guardian-query.service';
import { ActorContext } from '../ports/actor-context';

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return { userId: 'patient-user-1', email: 'patient@test.com', roles: ['PATIENT'], patientId: 'patient-1', ...overrides };
}

function makeSut() {
  const queryService: jest.Mocked<PatientGuardianQueryService> = {
    listDependentsByGuardian: jest.fn().mockResolvedValue([]),
    listGuardiansByPatient: jest.fn().mockResolvedValue([]),
    listPendingIncomingForPatient: jest.fn().mockResolvedValue([]),
    listPendingOutgoingByGuardian: jest.fn().mockResolvedValue([]),
  };

  const sut = new ListMyGuardiansUseCase(queryService);
  return { sut, queryService };
}

describe('ListMyGuardiansUseCase', () => {
  it('happy path: returns guardians for patient', async () => {
    const { sut, queryService } = makeSut();
    const actor = makeActor();

    const result = await sut.execute(actor);

    expect(queryService.listGuardiansByPatient).toHaveBeenCalledWith('patient-1');
    expect(result).toEqual({ data: [] });
  });

  it('forbidden: throws ForbiddenException when actor has no patientId', async () => {
    const { sut } = makeSut();
    const actor = makeActor({ patientId: undefined });

    await expect(sut.execute(actor)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
