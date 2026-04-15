import { Injectable } from '@nestjs/common';
import { PatientRepository } from '../../application/ports/patient.repository';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Patient } from '../../domain/entities/patient.entity';
import { PatientPrismaMapper } from '../mappers/patient-prisma.mapper';
import { PatientDocumentTypeEnum } from '../../domain/enums/patient-document-type.enum';

@Injectable()
export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(patient: Patient): Promise<void> {
    const data = PatientPrismaMapper.toPersistence(patient);
    // upsert: crea si no existe, actualiza si ya existe.
    await this.prisma.patient.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<Patient | null> {
    const raw = await this.prisma.patient.findFirst({
      where: { id, deletedAt: null },
    });

    return raw ? PatientPrismaMapper.toDomain(raw) : null;
  }

  async existsById(id: string): Promise<boolean> {
    // count es mas eficiente que findFirst cuando solo necesitamos saber si existe o no.
    const n = await this.prisma.patient.count({
      where: { id, deletedAt: null },
    });

    return n > 0;
  }

  async findByDocument(
    documentType: PatientDocumentTypeEnum,
    documentNumber: string,
  ): Promise<Patient | null> {
    const raw = await this.prisma.patient.findFirst({
      where: { documentType: documentType as any, documentNumber, deletedAt: null },
    });

    return raw ? PatientPrismaMapper.toDomain(raw) : null;
  }

  async update(patient: Patient): Promise<void> {
    const data = PatientPrismaMapper.toPersistence(patient);
    await this.prisma.patient.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        phone: data.phone,
        birthDate: data.birthDate,
        updatedAt: new Date(),
      },
    });
  }
}
