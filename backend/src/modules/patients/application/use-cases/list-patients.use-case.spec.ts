import { ListPatientsUseCase } from './list-patients.use-case';
import { PatientQueryService } from '../ports/patient-query.service';

function makePaginatedResult() {
    return {
        data: [
            { id: 'patient-1', firstName: 'John', lastName: 'Doe' },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
}

function makeSut() {
    const queryService: jest.Mocked<PatientQueryService> = {
        listPaginated: jest.fn().mockResolvedValue(makePaginatedResult()),
    };

    const sut = new ListPatientsUseCase(queryService);
    return { sut, queryService };
}

describe('ListPatientsUseCase', () => {
    it('happy path: delegates to query service and returns paginated result', async () => {
        const { sut, queryService } = makeSut();
        const query = { page: 1, limit: 10, search: '' };

        const result = await sut.execute(query);

        expect(queryService.listPaginated).toHaveBeenCalledWith(query);
        expect(result).toEqual(makePaginatedResult());
    });

    it('passes search filter to query service', async () => {
        const { sut, queryService } = makeSut();
        queryService.listPaginated.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        const query = { page: 1, limit: 10, search: 'john' };

        await sut.execute(query);

        expect(queryService.listPaginated).toHaveBeenCalledWith(query);
    });
});
