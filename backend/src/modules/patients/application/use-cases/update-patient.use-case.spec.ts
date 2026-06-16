import { UpdatePatientUseCase } from './update-patient.use-case';
import { PatientRepository } from '../ports/patient.repository';
import { PatientNotFoundError } from '../../domain/errors/patient-domain.errors';
import { Patient } from '../../domain/entities/patient.entity';
import { PatientFullName } from '../../domain/value-objects/patient-full-name.vo';
import { PatientDocument } from '../../domain/value-objects/patient-document.vo';
import { PatientDocumentTypeEnum } from '../../domain/enums/patient-document-type.enum';

function makePatient(id: string): Patient {
    return Patient.rehydrate({
        id,
        fullName: PatientFullName.create('John', 'Doe'),
        document: PatientDocument.create(PatientDocumentTypeEnum.DNI, '12345678'),
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

function makeSut() {
    const repo: jest.Mocked<PatientRepository> = {
        save: jest.fn(),
        findById: jest.fn(),
        existsById: jest.fn(),
        findByDocument: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
    };

    const sut = new UpdatePatientUseCase(repo);
    return { sut, repo };
}

describe('UpdatePatientUseCase', () => {
    it('happy path: updates patient and returns id', async () => {
        const { sut, repo } = makeSut();
        const patient = makePatient('patient-1');
        repo.findById.mockResolvedValueOnce(patient);

        const command = {
            id: 'patient-1',
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+56911111111',
            updatedByUserId: 'user-1',
        };

        const result = await sut.execute(command);

        expect(repo.findById).toHaveBeenCalledWith('patient-1');
        expect(repo.update).toHaveBeenCalledWith(patient);
        expect(result).toEqual({ id: 'patient-1' });
    });

    it('not found: throws PatientNotFoundError when patient does not exist', async () => {
        const { sut, repo } = makeSut();
        repo.findById.mockResolvedValueOnce(null);

        await expect(sut.execute({ id: 'nonexistent', firstName: 'Jane', lastName: 'Doe', updatedByUserId: 'user-1' }))
            .rejects.toThrow(PatientNotFoundError);
        expect(repo.update).not.toHaveBeenCalled();
    });
});
