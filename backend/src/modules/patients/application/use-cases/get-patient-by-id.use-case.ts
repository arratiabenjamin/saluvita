import { Inject, Injectable } from "@nestjs/common";
import type { PatientRepository } from '../ports/patient.repository';
import { Patient } from "../../domain/entities/patient.entity";
import { PatientNotFoundError } from "../../domain/errors/patient-domain.errors";

@Injectable()
export class GetPatientByIdUseCase {
    constructor(
        @Inject("PatientRepository")
        private readonly patientRepository: PatientRepository,
    ) {}

    async execute(id: string): Promise<Patient> {
        const patient = await this.patientRepository.findById(id);
        // Si no existe, lanzamos error de dominio - el filter global lo convierte a 404.
        if (!patient) throw new PatientNotFoundError(id);

        return patient;
    }
}
