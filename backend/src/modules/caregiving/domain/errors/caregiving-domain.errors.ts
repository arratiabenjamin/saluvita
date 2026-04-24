export class GuardianLinkAlreadyActiveError extends Error {
    constructor() {
        super('An active guardian link already exists for this patient and user.');
        this.name = 'GuardianLinkAlreadyActiveError';
    }
}

export class GuardianInvitationNotFoundError extends Error {
    constructor() {
        super('Guardian invitation not found or already processed.');
        this.name = 'GuardianInvitationNotFoundError';
    }
}

export class GuardianInvitationExpiredError extends Error {
    constructor() {
        super('Guardian invitation has expired.');
        this.name = 'GuardianInvitationExpiredError';
    }
}

export class CannotInviteSelfAsGuardianError extends Error {
    constructor() {
        super('You cannot invite yourself as a guardian of your own profile.');
        this.name = 'CannotInviteSelfAsGuardianError';
    }
}

export class TargetUserHasNoPatientProfileError extends Error {
    constructor() {
        super('Target user does not have a patient profile.');
        this.name = 'TargetUserHasNoPatientProfileError';
    }
}

export class EmailAlreadyInUseError extends Error {
    constructor() {
        super('Email is already in use by another account.');
        this.name = 'EmailAlreadyInUseError';
    }
}

export class DependentDocumentAlreadyExistsError extends Error {
    constructor() {
        super('A patient with this document already exists.');
        this.name = 'DependentDocumentAlreadyExistsError';
    }
}
