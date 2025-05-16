import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      return true;
    }

    const token = this.getTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const user = await this.jwtService.verifyAsync(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private getTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}