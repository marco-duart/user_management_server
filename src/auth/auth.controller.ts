import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserDocs } from '../database/docs/user.docs';
import { LoginDocs, LoginResponseDocs, RegisterDocs } from './docs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: RegisterDocs })
  @ApiResponse({
    status: 200,
    description: 'Successful to create user.',
    type: UserDocs,
  })
  registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with a user' })
  @ApiBody({ type: LoginDocs })
  @ApiResponse({
    status: 201,
    description: 'Successful login.',
    type: LoginResponseDocs,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
