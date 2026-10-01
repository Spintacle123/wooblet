import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';
import { Session } from './models';
import { createHash, randomBytes } from 'node:crypto';
export type AuthRequest = Request & { user: { id: string; role: string } };
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const randomToken = () => randomBytes(24).toString('base64url');
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const token = req.cookies?.wb_access;
    if (!token) throw new UnauthorizedException('Please sign in.');
    try {
      const claims = jwt.verify(token, process.env.JWT_ACCESS_SECRET!, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      if (!claims.sub || !claims.sessionId || !['USER', 'ADMIN'].includes(claims.role)) throw new Error('Invalid token');
      if (!await Session.exists({ _id: claims.sessionId, userId: claims.sub, expiresAt: { $gt: new Date() } })) throw new Error('Session revoked');
      req.user = { id: claims.sub, role: claims.role };
      return true;
    } catch { throw new UnauthorizedException('Your session has expired. Please sign in again.'); }
  }
}
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (context.switchToHttp().getRequest<AuthRequest>().user?.role !== 'ADMIN') throw new ForbiddenException('Administrator access required.');
    return true;
  }
}
