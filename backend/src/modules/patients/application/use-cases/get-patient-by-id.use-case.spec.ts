import { GetPatientByIdUseCase } from './get-patient-by-id.use-case';
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
        update: jest.fn(),
    };

    const sut = new GetPatientByIdUseCase(repo);
    return { sut, repo };
}

describe('GetPatientByIdUseCase', () => {
    it('happy path: returns patient when found', async () => {
        const { sut, repo } = makeSut();
        const patient = makePatient('patient-1');
        repo.findById.mockResolvedValueOnce(patient);

        const result = await sut.execute('patient-1');

        expect(repo.findById).toHaveBeenCalledWith('patient-1');
        expect(result).toBe(patient);
    });

    it('not found: throws PatientNotFoundError when patient does not exist', async () => {
        const { sut, repo } = makeSut();
        repo.findById.mockResolvedValueOnce(null);

        await expect(sut.execute('nonexistent')).rejects.toThrow(PatientNotFoundError);
    });
});
