import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/auth/guards/roles.guard';
import { Roles } from '../../shared/auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';
import { ROLE_ADMIN } from '../../shared/auth/roles.constants';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN)
@Controller('/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return { data: await this.usersService.create(dto) };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { data: await this.usersService.findById(id) };
  }

  @Get()
  async list(@Query() query: ListUsersQueryDto) {
    return {
      data: await this.usersService.list(
        query.page,
        query.limit,
        query.status,
        query.role,
      ),
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return { data: await this.usersService.update(id, dto) };
  }
}
