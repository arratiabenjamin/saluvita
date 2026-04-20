import { ActorContext } from "./actor-context";
import { AppointmentListScope } from "./appointment-query.service";

export interface AppointmentAccessService {
    ensureCanManagePatient(actor: ActorContext, patientId: string): Promise<void>;
    ensureCanReadAppointment(actor: ActorContext, appointmentId: string): Promise<void>;
    ensureCanManageAppointment(actor: ActorContext, appointmentId: string): Promise<void>;
    resolveListScope(actor: ActorContext): Promise<AppointmentListScope>;
}

