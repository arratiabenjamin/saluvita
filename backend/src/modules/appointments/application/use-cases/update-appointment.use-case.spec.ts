import { NotFoundException } from '@nestjs/common';
import { UpdateAppointmentUseCase } from './update-appointment.use-case';
import { AppointmentRepository } from '../ports/appointment.repository';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentStatusEnum } from '../../domain/enums/appointment-status.enum';
import { AppointmentStatusTransitionError } from '../../domain/errors/appointment-domain.errors';

function makeActor(): ActorContext {
    return { userId: 'user-1', role: 'PROFESSIONAL' };
}

function makePlannedAppointment(id: string): Appointment {
    return Appointment.rehydrate({
        id,
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startsAt: new Date('2026-07-01T10:00:00Z'),
        status: AppointmentStatusEnum.PLANNED,
    });
}

function makeCancelledAppointment(id: string): Appointment {
    return Appointment.rehydrate({
        id,
        patientId: 'patient-1',
        recordedByUserId: 'user-1',
        startsAt: new Date('2026-07-01T10:00:00Z'),
        status: AppointmentStatusEnum.CANCELLED,
        cancelledReason: 'No longer needed',
    });
}

function makeSut() {
    const repo: jest.Mocked<AppointmentRepository> = {
        save: jest.fn(),
        findById: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    };

    const access: jest.Mocked<AppointmentAccessService> = {
        ensureCanManagePatient: jest.fn().mockResolvedValue(undefined),
        ensureCanReadAppointment: jest.fn().mockResolvedValue(undefined),
        ensureCanManageAppointment: jest.fn().mockResolvedValue(undefined),
        resolveListScope: jest.fn().mockResolvedValue({ mode: 'all' }),
    };

    const sut = new UpdateAppointmentUseCase(repo, access);
    return { sut, repo, access };
}

describe('UpdateAppointmentUseCase', () => {
    it('happy path: updates appointment and returns id', async () => {
        const { sut, repo } = makeSut();
        const appointment = makePlannedAppointment('appt-1');
        repo.findById.mockResolvedValueOnce(appointment);

        const command = {
            id: 'appt-1',
            startsAt: new Date('2026-07-01T10:00:00Z'),
            endsAt: new Date('2026-07-01T11:00:00Z'),
            reason: 'Updated reason',
        };

        const result = await sut.execute(command, makeActor());

        expect(repo.update).toHaveBeenCalledWith(appointment);
        expect(result).toEqual({ id: 'appt-1' });
    });

    it('not found: throws NotFoundException when appointment does not exist', async () => {
        const { sut, repo } = makeSut();
        repo.findById.mockResolvedValueOnce(null);

        await expect(sut.execute({ id: 'nonexistent' }, makeActor())).rejects.toThrow(NotFoundException);
        expect(repo.update).not.toHaveBeenCalled();
    });

    it('domain error: throws AppointmentStatusTransitionError when appointment is not PLANNED', async () => {
        const { sut, repo } = makeSut();
        const appointment = makeCancelledAppointment('appt-1');
        repo.findById.mockResolvedValueOnce(appointment);

        await expect(sut.execute({ id: 'appt-1' }, makeActor())).rejects.toThrow(AppointmentStatusTransitionError);
        expect(repo.update).not.toHaveBeenCalled();
    });
});
