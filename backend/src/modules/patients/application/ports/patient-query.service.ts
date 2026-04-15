import type { ListPatientsQuery } from "../queries/list-patients.query";

export interface PatientQueryService {
  listPaginated(query: ListPatientsQuery): Promise<unknown>;
}
