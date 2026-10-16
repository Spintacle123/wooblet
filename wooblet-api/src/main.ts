import 'reflect-metadata';
import 'dotenv/config';
import { Module, Catch, ExceptionFilter, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import express from 'express';
import { join } from 'node:path';
import { AppService } from './service';
import { AuthGuard, AdminGuard } from './security';
import * as C from './controllers';
@Catch()
class ErrorFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    if (error instanceof HttpException) return res.status(error.getStatus()).json(error.getResponse());
    if (error.code === 11000) return res.status(409).json({ message: 'This record already exists.' });
    if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: 'Invalid data.' });
    Logger.error(error.message, error.stack);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
@Module({ controllers: Object.values(C), providers: [AppService, AuthGuard, AdminGuard] })
class AppModule {}
export async function bootstrap() {
  for (const key of ['MONGODB_URI', 'FRONTEND_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) if (!process.env[key]) throw new Error(`Set ${key} in wooblet-api/.env.`);
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) if (process.env[key]!.length < 32 || process.env[key]!.includes('replace-with')) throw new Error(`${key} must be a random secret of at least 32 characters.`);
  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) throw new Error('Use different access and refresh secrets.');
  if (!Number.isFinite(Number(process.env.SHIPPING_FEE ?? 99)) || Number(process.env.SHIPPING_FEE ?? 99) < 0) throw new Error('SHIPPING_FEE must be a nonnegative number.');
  if (process.env.S3_BUCKET) for (const key of ['S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_PUBLIC_URL']) if (!process.env[key]) throw new Error(`Set ${key} when enabling object storage.`);
  if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) throw new Error('Configure SMTP before production.');
  await mongoose.connect(process.env.MONGODB_URI!);
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  // CORS runs first so rate-limit and origin rejections remain readable by the browser.
  const allowedOrigins = new Set([process.env.FRONTEND_URL!]);
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:3001');
    allowedOrigins.add('http://127.0.0.1:3001');
  }
  app.enableCors({ origin: [...allowedOrigins], credentials: true });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false }));
  // Session checks (me, refresh, logout) run on every page view; only credential actions get the strict limit.
  app.use(['register', 'login', 'forgot-password', 'reset-password', 'verify-email', 'resend-verification'].map(p => `/api/auth/${p}`), rateLimit({ windowMs: 15 * 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api/public', rateLimit({ windowMs: 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api/tags', rateLimit({ windowMs: 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !allowedOrigins.has(req.headers.origin ?? '')) return res.status(403).json({ message: 'Request origin is not permitted.' });
    next();
  });
  app.useGlobalFilters(new ErrorFilter());
  if (process.env.NODE_ENV !== 'production') app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  const config = new DocumentBuilder().setTitle('Wooblet API').setDescription('Pet profiles, NFC identification, commerce, and operations.').setVersion('1.0').addCookieAuth('wb_access').build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  await app.listen(Number(process.env.PORT ?? 4001), '0.0.0.0');
  Logger.log(`Wooblet API is listening on port ${process.env.PORT ?? 4001}`);
  return app;
}
if (require.main === module) bootstrap().catch(error => { console.error(error.message); process.exit(1); });
