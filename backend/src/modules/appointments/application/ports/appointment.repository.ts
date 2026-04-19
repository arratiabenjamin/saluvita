import { Appointment } from "../../domain/entities/appointment.entity";

export interface AppointmentRepository {
    save(appointment: Appointment): Promise<void>;
    findById(id: string): Promise<Appointment | null>;
    update(appointment: Appointment): Promise<void>;
}

