import { CreatePatientUseCase } from './create-patient.use-case';
import { PatientRepository } from '../ports/patient.repository';
import { DuplicatePatientDocumentError } from '../../domain/errors/patient-domain.errors';
import { PatientDocumentTypeEnum } from '../../domain/enums/patient-document-type.enum';

function makeCommand() {
    return {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        documentType: PatientDocumentTypeEnum.DNI,
        documentNumber: '12345678',
        phone: '+56912345678',
        birthDate: new Date('1990-01-01'),
        createdByUserId: 'user-1',
    };
}

function makeSut() {
    const repo: jest.Mocked<PatientRepository> = {
        save: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        existsById: jest.fn(),
        findByDocument: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue(undefined),
    };

    const sut = new CreatePatientUseCase(repo);
    return { sut, repo };
}

describe('CreatePatientUseCase', () => {
    it('happy path: creates patient and returns id', async () => {
        const { sut, repo } = makeSut();
        repo.findByDocument.mockResolvedValueOnce(null);

        const result = await sut.execute(makeCommand());

        expect(repo.findByDocument).toHaveBeenCalledWith(
            PatientDocumentTypeEnum.DNI,
            '12345678',
        );
        expect(repo.save).toHaveBeenCalledTimes(1);
        expect(result).toHaveProperty('id');
        expect(typeof result.id).toBe('string');
    });

    it('domain error: throws DuplicatePatientDocumentError when document already exists', async () => {
        const { sut, repo } = makeSut();

        // Simulate an existing patient with the same document
        const existingPatient = { id: 'existing-patient' } as any;
        repo.findByDocument.mockResolvedValueOnce(existingPatient);

        await expect(sut.execute(makeCommand())).rejects.toThrow(DuplicatePatientDocumentError);
        expect(repo.save).not.toHaveBeenCalled();
    });
});
