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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRoleEnum } from '../enums/user-role.enum';
import { RoleGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dto/update.user.dto';
import { UserDocs } from '../database/docs/user.docs';


@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Admin gets all users with optional filters and sorting',
  })
  @ApiBearerAuth()
  async getAll(
    @Query('role') role?: UserRoleEnum,
    @Query('sortBy') sortBy?: 'name' | 'createdAt',
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return await this.usersService.getAll({ role, sortBy, order });
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
