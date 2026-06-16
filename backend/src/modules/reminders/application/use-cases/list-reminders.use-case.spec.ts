import { ListRemindersUseCase } from './list-reminders.use-case';
import { ReminderQueryService } from '../ports/reminder-query.service';
import { ReminderAccessService } from '../ports/reminder-access.service';
import { ActorContext } from '../ports/actor-context';
import { ReminderTypeEnum } from '../../domain/enums/reminder-type.enum';

function makeActor(): ActorContext {
  return { userId: 'user-1', roles: ['PROFESSIONAL'] };
}

function makeQuery() {
  return { page: 1, limit: 10 };
}

function makePaginatedResult() {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

function makeSut() {
  const queryService: jest.Mocked<ReminderQueryService> = {
    listPaginated: jest.fn().mockResolvedValue(makePaginatedResult()),
  };

  const access: jest.Mocked<ReminderAccessService> = {
    ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
    ensureCanReadReminder: jest.fn().mockResolvedValue(undefined),
    ensureCanManageReminder: jest.fn().mockResolvedValue(undefined),
    resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
  };

  const sut = new ListRemindersUseCase(queryService, access);
  return { sut, queryService, access };
}

describe('ListRemindersUseCase', () => {
  it('happy path: resolves scope and delegates to queryService', async () => {
    const { sut, queryService, access } = makeSut();
    const actor = makeActor();
    const query = makeQuery();

    const result = await sut.execute(query, actor);

    expect(access.resolveListScope).toHaveBeenCalledWith(actor);
    expect(queryService.listPaginated).toHaveBeenCalledWith(query, { mode: 'all' });
    expect(result).toEqual(makePaginatedResult());
  });

  it('scoped access: passes patients scope to queryService when actor is patient', async () => {
    const { sut, queryService, access } = makeSut();
    const actor: ActorContext = { userId: 'user-2', roles: ['PATIENT'], patientId: 'patient-2' };
    const scopedResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    access.resolveListScope.mockResolvedValueOnce({ mode: 'patients', patientIds: ['patient-2'] });
    queryService.listPaginated.mockResolvedValueOnce(scopedResult);

    const result = await sut.execute(makeQuery(), actor);

    expect(queryService.listPaginated).toHaveBeenCalledWith(
      makeQuery(),
      { mode: 'patients', patientIds: ['patient-2'] },
    );
    expect(result).toEqual(scopedResult);
  });

  it('filters: passes type filter through to queryService', async () => {
    const { sut, queryService } = makeSut();
    const query = { ...makeQuery(), type: ReminderTypeEnum.MEDICATION };

    await sut.execute(query, makeActor());

    expect(queryService.listPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ type: ReminderTypeEnum.MEDICATION }),
      expect.anything(),
    );
  });
});
