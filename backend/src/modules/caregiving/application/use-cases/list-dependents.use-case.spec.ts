import { ListDependentsUseCase } from './list-dependents.use-case';
import { PatientGuardianQueryService } from '../ports/patient-guardian-query.service';
import { ActorContext } from '../ports/actor-context';

function makeActor(): ActorContext {
  return { userId: 'guardian-1', email: 'guardian@test.com', roles: ['PATIENT'] };
}

function makeSut() {
  const queryService: jest.Mocked<PatientGuardianQueryService> = {
    listDependentsByGuardian: jest.fn().mockResolvedValue([]),
    listGuardiansByPatient: jest.fn().mockResolvedValue([]),
    listPendingIncomingForPatient: jest.fn().mockResolvedValue([]),
    listPendingOutgoingByGuardian: jest.fn().mockResolvedValue([]),
  };

  const sut = new ListDependentsUseCase(queryService);
  return { sut, queryService };
}

describe('ListDependentsUseCase', () => {
  it('happy path: returns dependents for guardian', async () => {
    const { sut, queryService } = makeSut();
    const actor = makeActor();

    const result = await sut.execute(actor);

    expect(queryService.listDependentsByGuardian).toHaveBeenCalledWith(actor.userId);
    expect(result).toEqual({ data: [] });
  });

  it('returns non-empty list when guardians exist', async () => {
    const { sut, queryService } = makeSut();
    const dependent = {
      guardianLinkId: 'link-1',
      patientId: 'patient-1',
      patientFirstName: 'Ana',
      patientLastName: 'García',
      patientDocumentType: 'DNI',
      patientDocumentNumber: '12345678A',
      patientEmail: null,
      relationship: 'parent',
      canEditProfile: true,
      canManageAppointments: true,
      acceptedAt: null,
      createdAt: new Date(),
    };
    queryService.listDependentsByGuardian.mockResolvedValueOnce([dependent]);

    const result = await sut.execute(makeActor());

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBe(dependent);
  });
});
