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
    summary: 'Admin gets users with last login over 30 days ago',
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
      'Admin gets all users with optional filters, sorting and pagination',
  })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiQuery({ name: 'sortBy', required: false, type: Number, description: 'Sort by name or createdAt' })
  @ApiQuery({ name: 'order', required: false, type: Number, description: 'ASC or DESC order sorted users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
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
  @ApiOperation({ summary: 'Self or admin update a user by ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Successful to update user',
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
  @ApiOperation({ summary: 'Admin delete a user by ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the user' })
  @ApiBearerAuth()
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.delete(id);
  }
}
