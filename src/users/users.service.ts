import { Repository } from 'typeorm';
import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEnum } from '../enums/user-role.enum';
import { EXCEPTION_MESSAGE } from '../enums/exception-message.enum';
import { SUCCESSFUL_MESSAGE } from '../enums/successful-message.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUsersWithLastLoginOver30Days(
    options?: IPaginationOptions,
  ): Promise<Pagination<User>> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');

      const dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      queryBuilder.where(
        '(user.lastLoginAt < :dateThreshold OR ' +
          '(user.lastLoginAt IS NULL AND user.createdAt < :dateThreshold))',
        { dateThreshold },
      );

      queryBuilder.orderBy('user.lastLoginAt', 'DESC');

      return paginate<User>(queryBuilder, options);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getAll(
    filters?: {
      role?: UserRoleEnum;
      sortBy?: 'name' | 'createdAt';
      order?: 'ASC' | 'DESC';
    },
    options?: IPaginationOptions,
  ): Promise<Pagination<User>> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');

      if (filters?.role) {
        queryBuilder.where('user.role = :role', { role: filters.role });
      }

      if (filters?.sortBy) {
        queryBuilder.orderBy(`user.${filters.sortBy}`, filters.order || 'ASC');
      }

      return paginate<User>(queryBuilder, options);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getById(id: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(EXCEPTION_MESSAGE.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async update(
    id: number,
    data: UpdateUserDto,
    userId: number,
    userRole: UserRoleEnum,
  ) {
    try {
      const user = await this.getById(id);

      if (userId !== user.id && userRole !== UserRoleEnum.ADMIN) {
        throw new ForbiddenException(EXCEPTION_MESSAGE.FORBIDDEN);
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      await this.usersRepository.update(id, data);

      return await this.getById(id);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async delete(id: number) {
    try {
      await this.getById(id);
      await this.usersRepository.softDelete(id);

      return { response: SUCCESSFUL_MESSAGE.DELETE_USER };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
