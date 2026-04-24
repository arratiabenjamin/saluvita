export class MedicalHistoryEntryNotFoundError extends Error {
    constructor(id: string) {
        super(`Medical history entry with id '${id}' was not found.`);
        this.name = 'MedicalHistoryEntryNotFoundError';
    }
}

export class MedicalHistoryAttachmentNotFoundError extends Error {
    constructor(id: string) {
        super(`Medical history attachment with id '${id}' was not found.`);
        this.name = 'MedicalHistoryAttachmentNotFoundError';
    }
}

export class MedicalHistoryEntryPatientMismatchError extends Error {
    constructor() {
        super('Entry does not belong to the specified patient.');
        this.name = 'MedicalHistoryEntryPatientMismatchError';
    }
}

export class InvalidAttachmentFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidAttachmentFileError';
    }
}
