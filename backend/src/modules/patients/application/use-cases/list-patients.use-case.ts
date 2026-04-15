// La lectura paginada va al QueryService, no al repositorio principal.
// Esto mantiene el repositorio limpio y las lecturas complejas separadas.

import { Inject, Injectable } from "@nestjs/common";
import { ListPatientsQuery } from "../queries/list-patients.query";
import type { PatientQueryService } from "../ports/patient-query.service";

@Injectable()
export class ListPatientsUseCase {
    constructor(
        @Inject("PatientQueryService")
        private readonly patientQueryService: PatientQueryService,
    ) {}

    async execute(query: ListPatientsQuery) {
        return this.patientQueryService.listPaginated(query);
    }
}
