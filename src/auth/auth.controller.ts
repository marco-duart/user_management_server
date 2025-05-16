import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { UserDocs } from '../database/docs/user.docs';
import { LoginDocs, LoginResponseDocs, RegisterDocs } from './docs';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentUserDto } from '../decorators/dto/current-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: RegisterDocs })
  @ApiResponse({
    status: 200,
    description: 'Usuário criado com sucesso',
    type: UserDocs,
  })
  registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiBody({ type: LoginDocs })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso',
    type: LoginResponseDocs,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Obtém informações do usuário logado' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário obtidas com sucesso',
    type: UserDocs,
  })
  me(@CurrentUser() user: CurrentUserDto) {
    return this.authService.me(user.user);
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  @ApiOperation({ summary: 'Inicia autenticação pelo Google' })
  @ApiResponse({
    status: 302,
    description: 'Redireciona para a página de autenticação do Google',
  })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req, @Res() res) {
    console.log('Iniciando autenticação Google...');
    const { user } = req;
    if (!user) {
      return res.redirect(`${this.configService.get('FRONTEND_ERROR_URL')}`);
    }

    const existingUser = await this.authService.findOrCreateUser(user);

    const token = await this.authService.generateJwt(existingUser);

    return res.redirect(
      `${this.configService.get('FRONTEND_URL')}?token=${token}`,
    );
  }
}
