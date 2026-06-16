import { NotFoundException } from '@nestjs/common';
import { GetAppointmentByIdUseCase } from './get-appointment-by-id.use-case';
import { AppointmentRepository } from '../ports/appointment.repository';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentStatusEnum } from '../../domain/enums/appointment-status.enum';

function makeActor(): ActorContext {
    return { userId: 'user-1', roles: ['PROFESSIONAL'] };
}

function makeAppointment(id: string): Appointment {
    return Appointment.rehydrate({
        id,
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startsAt: new Date('2026-07-01T10:00:00Z'),
        status: AppointmentStatusEnum.PLANNED,
    });
}

function makeSut() {
    const repo: jest.Mocked<AppointmentRepository> = {
        save: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
    };

    const access: jest.Mocked<AppointmentAccessService> = {
        ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
        ensureCanReadAppointment: jest.fn().mockResolvedValue(undefined),
        ensureCanManageAppointment: jest.fn().mockResolvedValue(undefined),
        resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
    };

    const sut = new GetAppointmentByIdUseCase(repo, access);
    return { sut, repo, access };
}

describe('GetAppointmentByIdUseCase', () => {
    it('happy path: returns appointment when found', async () => {
        const { sut, repo } = makeSut();
        const appointment = makeAppointment('appt-1');
        repo.findById.mockResolvedValueOnce(appointment);

        const result = await sut.execute('appt-1', makeActor());

        expect(result).toBe(appointment);
        expect(repo.findById).toHaveBeenCalledWith('appt-1');
    });

    it('not found: throws NotFoundException when repo returns null', async () => {
        const { sut, repo } = makeSut();
        repo.findById.mockResolvedValueOnce(null);

        await expect(sut.execute('nonexistent', makeActor())).rejects.toThrow(NotFoundException);
    });
});
