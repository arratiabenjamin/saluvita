import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { RoleCode } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureRoleIds(codes: string[]): Promise<string[]> {
    const roleIds: string[] = [];

    for (const code of codes) {
      const roleCode = code as RoleCode;
      const role = await this.prisma.role.upsert({
        where: { code: roleCode },
        create: { code: roleCode, name: code },
        update: {},
      });
      roleIds.push(role.id);
    }

    return roleIds;
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
    if (exists) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const roleIds = await this.ensureRoleIds(dto.roles);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          status: dto.status ?? 'ACTIVE',
        },
      });

      for (const roleId of roleIds) {
        await tx.userRole.create({ data: { userId: user.id, roleId } });
      }

      return user;
    });

    return this.findById(created.id);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles: user.userRoles.map((ur) => ur.role.code),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async list(page: number, limit: number, status?: string, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (role) {
      where.userRoles = {
        some: {
          role: { code: role },
        },
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { userRoles: { include: { role: true } } },
      }),
    ]);

    return {
      data: items.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: user.userRoles.map((ur) => ur.role.code),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('User not found');

    await this.prisma.$transaction(async (tx) => {
      const data: any = {};
      if (dto.firstName !== undefined) data.firstName = dto.firstName.trim();
      if (dto.lastName !== undefined) data.lastName = dto.lastName.trim();
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.password !== undefined) data.passwordHash = await bcrypt.hash(dto.password, 10);

      if (Object.keys(data).length > 0) {
        await tx.user.update({ where: { id }, data });
      }

      if (dto.roles) {
        const roleIds = await this.ensureRoleIds(dto.roles);
        await tx.userRole.deleteMany({ where: { userId: id } });
        for (const roleId of roleIds) {
          await tx.userRole.create({ data: { userId: id, roleId } });
        }
      }
    });

    return this.findById(id);
  }
}
