// Contexto mínimo del usuario autenticado que usa la capa de aplicación.
// Esto evita acoplar use-cases a objetos HTTP de Nest.
export interface ActorContext {
    userId: string;
    roles: string[];
    patientId?: string;
}

