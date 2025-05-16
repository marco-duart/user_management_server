import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EXCEPTION_MESSAGE } from '../enums/exception-message.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerPayload: RegisterDto) {
    try {
      const userEmail = await this.findEmail(registerPayload.email);

      if (userEmail) {
        throw new BadRequestException(EXCEPTION_MESSAGE.EMAIL_EXISTS);
      }
      const createUser = this.userRepository.create(registerPayload);

      await this.userRepository.save(createUser);

      return createUser;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findEmail(email: string) {
    try {
      return await this.userRepository.exists({ where: { email } });
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
        select: {
          email: true,
          id: true,
          password: true,
          role: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.getUserByEmail(loginDto.email);
      if (!user) {
        throw new HttpException(
          EXCEPTION_MESSAGE.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const compare = await bcrypt.compare(loginDto.password, user.password);

      if (!compare) {
        throw new UnauthorizedException(EXCEPTION_MESSAGE.WRONG_CREDENTIALS);
      }

      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      const token = await this.generateJwt(user);

      return {
        token,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async me(id: number) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOrCreateUser(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      let user = await this.userRepository.findOne({
        where: { email: googleUser.email },
      });

      if (!user) {
        user = this.userRepository.create({
          email: googleUser.email,
          name: `${googleUser.firstName} ${googleUser.lastName}`,
          password: await Math.random().toString(36),
        });
        await this.userRepository.save(user);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateJwt(user: User) {
    try {
      const payload = {
        email: user.email,
        user: user.id,
        role: user.role,
      };
      return this.jwtService.signAsync(payload);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
