import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/prisma/prisma.service";
import { ListPatientsQuery } from "../../application/queries/list-patients.query";

@Injectable()
export class PrismaPatientQueryService {
    constructor(private readonly prisma: PrismaService) {}

    async listPaginated(query: ListPatientsQuery) {
        const { page, limit, search, patientId } = query;
        const skip = (page - 1) * limit;

        // Contruir filtro de busqueda libre
        const where: any = { deletedAt: null };
        if (patientId) {
            where.id = patientId;
        }
        if(search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { documentNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Ejecutar count y data en paralelo para mejor performance
        const [total, items] = await Promise.all([
            this.prisma.patient.count({ where }),
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
                //Proyeccion: solo los campos necesarios para la lista, no toda la entidad.
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    documentType: true,
                    documentNumber: true,
                    phone: true,
                    createdAt: true,
                }
            }),
        ]);

        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        }
    }
}
