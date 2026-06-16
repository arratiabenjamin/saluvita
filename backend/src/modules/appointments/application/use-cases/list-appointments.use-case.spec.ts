import { ListAppointmentsUseCase } from './list-appointments.use-case';
import { AppointmentQueryService, AppointmentListScope } from '../ports/appointment-query.service';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';

function makeActor(): ActorContext {
    return { userId: 'user-1', roles: ['PROFESSIONAL'] };
}

function makePaginatedResult() {
    return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
}

function makeSut() {
    const queryService: jest.Mocked<AppointmentQueryService> = {
        listPaginated: jest.fn().mockResolvedValue(makePaginatedResult()),
        listProfessionals: jest.fn().mockResolvedValue([]),
    };

    const access: jest.Mocked<AppointmentAccessService> = {
        ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
        ensureCanReadAppointment: jest.fn().mockResolvedValue(undefined),
        ensureCanManageAppointment: jest.fn().mockResolvedValue(undefined),
        resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' } as AppointmentListScope),
    };

    const sut = new ListAppointmentsUseCase(queryService, access);
    return { sut, queryService, access };
}

describe('ListAppointmentsUseCase', () => {
    it('happy path: resolves scope and returns paginated result', async () => {
        const { sut, queryService, access } = makeSut();
        const actor = makeActor();
        const query = { page: 1, limit: 10 };

        const result = await sut.execute(query, actor);

        expect(access.resolveListScope).toHaveBeenCalledWith(actor);
        expect(queryService.listPaginated).toHaveBeenCalledWith(query, { mode: 'all' });
        expect(result).toEqual(makePaginatedResult());
    });

    it('access guard rejection: propagates error from resolveListScope', async () => {
        const { sut, access } = makeSut();
        const guardError = new Error('Access denied');
        access.resolveListScope.mockRejectedValueOnce(guardError);

        await expect(sut.execute({ page: 1, limit: 10 }, makeActor())).rejects.toThrow(guardError);
    });
});
