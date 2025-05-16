import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRoleEnum } from '../enums/user-role.enum';
import { RoleGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocs } from '../database/docs/user.docs';
import { Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('inactive')
  @ApiOperation({
    summary: 'Admin obtém usuários com último login há mais de 30 dias',
  })
  @ApiBearerAuth()
  async getInactiveUsers(
    @Query() paginationOptions?: IPaginationOptions,
  ): Promise<Pagination<UserResponseDto>> {
    return await this.usersService.getUsersWithLastLoginOver30Days({
      page: paginationOptions?.page || 1,
      limit: paginationOptions?.limit || 10,
    });
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  @ApiOperation({
    summary:
      'Admin obtém todos os usuários com filtros opcionais, ordenação e paginação',
  })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filtrar por perfil (role' })
  @ApiQuery({ name: 'sortBy', required: false, type: Number, description: 'Ordenar por nome ou data de criação' })
  @ApiQuery({ name: 'order', required: false, type: Number, description: 'Ordenação ASC ou DESC' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página', example: 10 })
  @ApiBearerAuth()
  async getAll(
    @Query('role') role?: UserRoleEnum,
    @Query('sortBy') sortBy?: 'name' | 'createdAt',
    @Query('order') order?: 'ASC' | 'DESC',
    @Query() paginationOptions?: IPaginationOptions,
  ): Promise<Pagination<UserResponseDto>> {
    return await this.usersService.getAll(
      { role, sortBy, order },
      {
        page: paginationOptions?.page || 1,
        limit: paginationOptions?.limit || 10,
      },
    );
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Usuário atualiza a si próprio ou admin atualiza um usuário pelo ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do usuário' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    type: UserDocs,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: CurrentUserDto,
  ) {
    return await this.usersService.update(id, data, user.user, user.role);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin deleta um usuário pelo ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do usuário' })
  @ApiBearerAuth()
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.delete(id);
  }
}
