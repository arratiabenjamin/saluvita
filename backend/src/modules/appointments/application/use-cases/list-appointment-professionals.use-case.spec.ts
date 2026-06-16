import { ListAppointmentProfessionalsUseCase } from './list-appointment-professionals.use-case';
import { AppointmentQueryService, AppointmentListScope, AppointmentProfessionalSummary } from '../ports/appointment-query.service';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';

function makeActor(): ActorContext {
    return { userId: 'user-1', roles: ['PROFESSIONAL'] };
}

function makeProfessionalSummary(): AppointmentProfessionalSummary {
    return {
        id: 'prof-1',
        doctorName: 'Dr. House',
        specialty: 'Diagnostics',
        facilityName: 'Princeton-Plainsboro',
        facilityAddress: '123 Main St',
        totalAppointments: 5,
        lastAppointmentAt: new Date('2026-06-01T10:00:00Z'),
        lastCompletedAt: new Date('2026-06-01T11:00:00Z'),
        nextAppointmentAt: new Date('2026-07-01T10:00:00Z'),
    };
}

function makeSut() {
    const queryService: jest.Mocked<AppointmentQueryService> = {
        listPaginated: jest.fn(),
        listProfessionals: jest.fn().mockResolvedValue([makeProfessionalSummary()]),
    };

    const access: jest.Mocked<AppointmentAccessService> = {
        ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
        ensureCanReadAppointment: jest.fn().mockResolvedValue(undefined),
        ensureCanManageAppointment: jest.fn().mockResolvedValue(undefined),
        resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' } as AppointmentListScope),
    };

    const sut = new ListAppointmentProfessionalsUseCase(queryService, access);
    return { sut, queryService, access };
}

describe('ListAppointmentProfessionalsUseCase', () => {
    it('happy path: resolves scope and returns list of professionals', async () => {
        const { sut, queryService, access } = makeSut();
        const actor = makeActor();
        const query = { patientId: 'patient-1' };

        const result = await sut.execute(query, actor);

        expect(access.resolveListScope).toHaveBeenCalledWith(actor);
        expect(queryService.listProfessionals).toHaveBeenCalledWith(query, { mode: 'all' });
        expect(result).toHaveLength(1);
        expect(result[0].doctorName).toBe('Dr. House');
    });

    it('scoped access: passes patient-scoped list scope to query service', async () => {
        const { sut, queryService, access } = makeSut();
        const scope: AppointmentListScope = { mode: 'patients', patientIds: ['patient-1'] };
        access.resolveListScope.mockResolvedValueOnce(scope);

        await sut.execute({ patientId: 'patient-1' }, makeActor());

        expect(queryService.listProfessionals).toHaveBeenCalledWith(
            { patientId: 'patient-1' },
            scope,
        );
    });
});
