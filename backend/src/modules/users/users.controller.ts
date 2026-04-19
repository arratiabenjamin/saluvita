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
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLE_ADMIN)
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear usuario staff' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Usuario creado correctamente' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
  @ApiForbiddenResponse({ description: 'Solo ADMIN' })
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return { data: await this.usersService.create(dto) };
  }

  @ApiOperation({ summary: 'Obtener usuario por id' })
  @ApiParam({ name: 'id', example: '36bb7863-545a-4024-abdb-b9bb812932db' })
  @ApiOkResponse({ description: 'Usuario encontrado' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return { data: await this.usersService.findById(id) };
  }

  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'role', required: false, example: 'ADMIN' })
  @ApiOkResponse({ description: 'Listado paginado de usuarios' })
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

  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', example: '36bb7863-545a-4024-abdb-b9bb812932db' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Usuario actualizado' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return { data: await this.usersService.update(id, dto) };
  }
}
