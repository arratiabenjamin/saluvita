import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { AppointmentRepository } from '../ports/appointment.repository';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
    return { userId: 'user-1', role: 'PROFESSIONAL', ...overrides };
}

function makeCommand() {
    return {
        patientId: 'patient-1',
        startsAt: new Date('2026-07-01T10:00:00Z'),
        endsAt: new Date('2026-07-01T11:00:00Z'),
        reason: 'Routine check-up',
        facilityName: 'Clinic A',
        facilityAddress: '123 Main St',
        doctorName: 'Dr. Smith',
        specialty: 'General',
    };
}

function makeSut() {
    const repo: jest.Mocked<AppointmentRepository> = {
        save: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    };

    const access: jest.Mocked<AppointmentAccessService> = {
        ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
        ensureCanReadAppointment: jest.fn().mockResolvedValue(undefined),
        ensureCanManageAppointment: jest.fn().mockResolvedValue(undefined),
        resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
    };

    const sut = new CreateAppointmentUseCase(repo, access);
    return { sut, repo, access };
}

describe('CreateAppointmentUseCase', () => {
    it('happy path: saves appointment and returns id', async () => {
        const { sut, repo, access } = makeSut();
        const actor = makeActor();
        const command = makeCommand();

        const result = await sut.execute(command, actor);

        expect(access.ensureCanManagePatient).toHaveBeenCalledWith(actor, command.patientId);
        expect(repo.save).toHaveBeenCalledTimes(1);
        expect(result).toHaveProperty('id');
        expect(typeof result.id).toBe('string');
    });

    it('access guard rejection: does not call repo.save when access denied', async () => {
        const { sut, repo, access } = makeSut();
        const actor = makeActor();
        const command = makeCommand();
        const guardError = new Error('Access denied');
        access.ensureCanManagePatient.mockRejectedValueOnce(guardError);

        await expect(sut.execute(command, actor)).rejects.toThrow(guardError);
        expect(repo.save).not.toHaveBeenCalled();
    });
});
