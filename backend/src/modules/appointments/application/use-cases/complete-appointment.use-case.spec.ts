import { NotFoundException } from '@nestjs/common';
import { CompleteAppointmentUseCase } from './complete-appointment.use-case';
import { AppointmentRepository } from '../ports/appointment.repository';
import { AppointmentAccessService } from '../ports/appointment-access.service';
import { ActorContext } from '../ports/actor-context';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentStatusEnum } from '../../domain/enums/appointment-status.enum';
import { AppointmentStatusTransitionError } from '../../domain/errors/appointment-domain.errors';
import { CreateEntriesFromAppointmentUseCase } from '../../../medical-history/application/use-cases/create-entries-from-appointment.use-case';

function makeActor(): ActorContext {
    return { userId: 'user-1', roles: ['PROFESSIONAL'] };
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

    const createEntries = {
        execute: jest.fn().mockResolvedValue({ created: 0 }),
    } as unknown as CreateEntriesFromAppointmentUseCase;

    const sut = new CompleteAppointmentUseCase(repo, access, createEntries);
    return { sut, repo, access, createEntries };
}

describe('CompleteAppointmentUseCase', () => {
    it('happy path: completes a planned appointment, calls createEntries, returns id', async () => {
        const { sut, repo, createEntries } = makeSut();
        const appointment = makePlannedAppointment('appt-1');
        repo.findById.mockResolvedValueOnce(appointment);

        const command = {
            id: 'appt-1',
            endsAt: new Date('2026-07-01T11:00:00Z'),
            wasAttended: true,
            diagnosis: 'All good',
        };

        const result = await sut.execute(command, makeActor());

        expect(repo.update).toHaveBeenCalledWith(appointment);
        expect(createEntries.execute).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: 'appt-1' });
    });

    it('not found: throws NotFoundException when appointment does not exist', async () => {
        const { sut, repo, createEntries } = makeSut();
        repo.findById.mockResolvedValueOnce(null);

        await expect(sut.execute({ id: 'nonexistent' }, makeActor())).rejects.toThrow(NotFoundException);
        expect(repo.update).not.toHaveBeenCalled();
        expect(createEntries.execute).not.toHaveBeenCalled();
    });

    it('domain error: throws AppointmentStatusTransitionError when appointment is not PLANNED', async () => {
        const { sut, repo, createEntries } = makeSut();
        const appointment = makeCancelledAppointment('appt-1');
        repo.findById.mockResolvedValueOnce(appointment);

        await expect(sut.execute({ id: 'appt-1' }, makeActor())).rejects.toThrow(AppointmentStatusTransitionError);
        expect(repo.update).not.toHaveBeenCalled();
        expect(createEntries.execute).not.toHaveBeenCalled();
    });
});
