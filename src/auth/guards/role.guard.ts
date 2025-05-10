import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '../../enums/user-role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  

  if(!role) {
    return true;
  }

  const request = context.switchToHttp().getRequest();
  const { user } = request;

  return !!role.find((role) => role === user.role)
  }
}
