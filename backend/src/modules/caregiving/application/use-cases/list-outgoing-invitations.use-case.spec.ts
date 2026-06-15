import { ListOutgoingInvitationsUseCase } from './list-outgoing-invitations.use-case';
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

  const sut = new ListOutgoingInvitationsUseCase(queryService);
  return { sut, queryService };
}

describe('ListOutgoingInvitationsUseCase', () => {
  it('happy path: returns outgoing invitations for guardian', async () => {
    const { sut, queryService } = makeSut();
    const actor = makeActor();

    const result = await sut.execute(actor);

    expect(queryService.listPendingOutgoingByGuardian).toHaveBeenCalledWith(actor.userId);
    expect(result).toEqual({ data: [] });
  });

  it('returns non-empty list when pending invitations exist', async () => {
    const { sut, queryService } = makeSut();
    const invitation = {
      guardianLinkId: 'link-1',
      invitationToken: 'token-abc',
      invitationExpiresAt: new Date('2026-08-01'),
      invitedAt: new Date(),
      relationship: null,
      canEditProfile: true,
      canManageAppointments: true,
      patientId: 'patient-1',
      patientFirstName: 'Ana',
      patientLastName: 'García',
      guardianUserId: 'guardian-1',
      guardianFirstName: 'Juan',
      guardianLastName: 'Pérez',
      guardianEmail: 'guardian@test.com',
      createdAt: new Date(),
    };
    queryService.listPendingOutgoingByGuardian.mockResolvedValueOnce([invitation]);

    const result = await sut.execute(makeActor());

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBe(invitation);
  });
});
