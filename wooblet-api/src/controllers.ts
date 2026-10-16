import { Controller, Get, Post, Patch, Delete, Body, Param, Req, Res, UseGuards, Inject, UseInterceptors, UploadedFile, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiCookieAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard, AdminGuard, AuthRequest } from './security';
import { AppService, objectId, safeUser } from './service';
import { Pet, Tag, Product, Order, FinderReport, User, ScanEvent } from './models';
import * as D from './dto';
import QRCode from 'qrcode';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
function cookies(res: Response, result: { access: string; refresh: string }) {
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api' };
  res.cookie('wb_access', result.access, { ...options, maxAge: 15 * 60 * 1000 });
  res.cookie('wb_refresh', result.refresh, { ...options, path: '/api/auth', maxAge: 30 * 86400000 });
}
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Post('register') @ApiOperation({ summary: 'Create an account and start a session' }) @ApiBody({ type: D.RegisterDto })
  async register(@Body(new D.DtoPipe(D.RegisterDto)) data: D.RegisterDto, @Res({ passthrough: true }) res: Response) { const r = await this.s.register(data); cookies(res, r); return r.user; }
  @Post('login') @ApiBody({ type: D.LoginDto })
  async login(@Body(new D.DtoPipe(D.LoginDto)) data: D.LoginDto, @Res({ passthrough: true }) res: Response) { const r = await this.s.login(data); cookies(res, r); return r.user; }
  @Post('refresh')
  async refresh(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { const r = await this.s.refresh(req.cookies?.wb_refresh); cookies(res, r); return r.user; }
  @Post('logout')
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) { const r = await this.s.logout(req.cookies?.wb_refresh); res.clearCookie('wb_access', { path: '/api' }); res.clearCookie('wb_refresh', { path: '/api/auth' }); return r; }
  @Get('me') @UseGuards(AuthGuard) @ApiCookieAuth() me(@Req() req: AuthRequest) { return this.s.me(req.user.id); }
  @Post('forgot-password') @ApiBody({ type: D.EmailDto }) forgot(@Body(new D.DtoPipe(D.EmailDto)) data: D.EmailDto) { return this.s.forgot(data); }
  @Post('reset-password') @ApiBody({ type: D.ResetDto }) reset(@Body(new D.DtoPipe(D.ResetDto)) data: D.ResetDto) { return this.s.reset(data); }
  @Post('verify-email') @ApiBody({ type: D.TokenDto }) verify(@Body(new D.DtoPipe(D.TokenDto)) data: D.TokenDto) { return this.s.verify(data); }
  @Post('resend-verification') @UseGuards(AuthGuard) resend(@Req() req: AuthRequest) { return this.s.resend(req.user.id); }
}
@ApiTags('Pets') @ApiCookieAuth() @UseGuards(AuthGuard) @Controller('pets')
export class PetsController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Get() list(@Req() req: AuthRequest) { return Pet.find({ ownerId: req.user.id }).sort({ createdAt: -1 }); }
  @Get(':id') get(@Param('id') id: string, @Req() req: AuthRequest) { return this.s.pet(id, req.user.id); }
  @Post() @ApiBody({ type: D.PetDto }) create(@Body(new D.DtoPipe(D.PetDto)) data: D.PetDto, @Req() req: AuthRequest) { return this.s.createPet(req.user.id, data); }
  @Patch(':id') @ApiBody({ type: D.PetDto }) update(@Param('id') id: string, @Body(new D.DtoPipe(D.PetDto)) data: D.PetDto, @Req() req: AuthRequest) { return this.s.updatePet(id, req.user.id, data); }
  @Delete(':id') delete(@Param('id') id: string, @Req() req: AuthRequest) { return this.s.deletePet(id, req.user.id); }
}
@ApiTags('Wooblets') @ApiCookieAuth() @UseGuards(AuthGuard) @Controller('tags')
export class TagsController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Get() list(@Req() req: AuthRequest) { return Tag.find({ ownerId: req.user.id }).populate('petId', 'name species photoUrl').sort({ createdAt: -1 }); }
  @Get(':id') get(@Param('id') id: string, @Req() req: AuthRequest) { return this.s.ownerTag(id, req.user.id); }
  @Post(':token/activate') @ApiBody({ type: D.ActivateDto }) activate(@Param('token') token: string, @Body(new D.DtoPipe(D.ActivateDto)) data: D.ActivateDto, @Req() req: AuthRequest) { return this.s.activate(token, req.user.id, data); }
  @Patch(':id/pet') @ApiBody({ type: D.LinkDto }) link(@Param('id') id: string, @Body(new D.DtoPipe(D.LinkDto)) data: D.LinkDto, @Req() req: AuthRequest) { return this.s.link(id, req.user.id, data); }
}
@ApiTags('Public finder') @Controller('public/tags')
export class PublicController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Get(':token') get(@Param('token') token: string) { return this.s.publicTag(token); }
  @Post(':token/verify-activation-code') @ApiBody({ type: D.ActivationCodeDto }) verify(@Param('token') token: string, @Body(new D.DtoPipe(D.ActivationCodeDto)) data: D.ActivationCodeDto) { return this.s.verifyActivationCode(token, data.activationCode); }
  @Post(':token/found-location') @ApiBody({ type: D.FoundDto }) found(@Param('token') token: string, @Body(new D.DtoPipe(D.FoundDto)) data: D.FoundDto) { return this.s.found(token, data); }
}
@ApiTags('Products') @Controller('products')
export class ProductsController {
  @Get() list() { return Product.find({ active: true }).sort({ createdAt: 1 }); }
  @Get(':slug') async get(@Param('slug') slug: string) { const p = await Product.findOne({ slug, active: true }); if (!p) throw new NotFoundException('Product not found.'); return p; }
}
@ApiTags('Orders') @ApiCookieAuth() @UseGuards(AuthGuard) @Controller('orders')
export class OrdersController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Post() @ApiBody({ type: D.OrderDto }) create(@Body(new D.DtoPipe(D.OrderDto)) data: D.OrderDto, @Req() req: AuthRequest) { return this.s.createOrder(req.user.id, data); }
  @Get() list(@Req() req: AuthRequest) { return Order.find({ userId: req.user.id }).sort({ createdAt: -1 }); }
  @Get(':number') get(@Param('number') number: string, @Req() req: AuthRequest) { return this.s.order(number, req.user.id); }
}
@ApiTags('Finder reports') @ApiCookieAuth() @UseGuards(AuthGuard) @Controller('finder-reports')
export class ReportsController {
  @Get() list(@Req() req: AuthRequest) { return FinderReport.find({ ownerId: req.user.id }).populate('petId', 'name').sort({ createdAt: -1 }).limit(200); }
}
@ApiTags('Uploads') @ApiCookieAuth() @UseGuards(AuthGuard) @Controller('uploads')
export class UploadsController {
  @Post('image') @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) }))
  async image(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choose a JPEG, PNG, or WebP image smaller than 5 MB.');
    const b = file.buffer;
    const ext = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff ? 'jpg' : b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' ? 'webp' : undefined;
    if (!ext) throw new BadRequestException('The file does not contain a supported image.');
    const name = `${randomBytes(20).toString('hex')}.${ext}`;
    const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    if (process.env.S3_BUCKET) {
      const client = new S3Client({ endpoint: process.env.S3_ENDPOINT || undefined, region: process.env.S3_REGION ?? 'auto', forcePathStyle: true, credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! } });
      await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: name, Body: b, ContentType: contentType }));
      return { url: `${process.env.S3_PUBLIC_URL}/${name}` };
    }
    if (process.env.NODE_ENV === 'production') throw new BadRequestException('Object storage must be configured for production uploads.');
    await mkdir(join(process.cwd(), 'uploads'), { recursive: true });
    await writeFile(join(process.cwd(), 'uploads', name), b);
    return { url: `${process.env.API_URL ?? 'http://localhost:4001'}/uploads/${name}` };
  }
}
@ApiTags('Administration') @ApiCookieAuth() @UseGuards(AuthGuard, AdminGuard) @Controller('admin')
export class AdminController {
  constructor(@Inject(AppService) private readonly s: AppService) {}
  @Get('summary') async summary() {
    const [orders, pendingPayments, pets, tags, customers, scans] = await Promise.all([Order.countDocuments(), Order.countDocuments({ status: 'AWAITING_PAYMENT' }), Pet.countDocuments(), Tag.countDocuments(), User.countDocuments({ role: 'USER' }), ScanEvent.countDocuments()]);
    return { orders, pendingPayments, pets, tags, customers, scans };
  }
  @Get('orders') orders() { return Order.find().sort({ createdAt: -1 }).limit(200); }
  @Get('orders/:id') order(@Param('id') id: string) { return this.s.adminOrder(id); }
  @Patch('orders/:id/payment') @ApiBody({ type: D.PaymentDto }) payment(@Param('id') id: string, @Body(new D.DtoPipe(D.PaymentDto)) data: D.PaymentDto, @Req() req: AuthRequest) { return this.s.payment(id, req.user.id, data); }
  @Patch('orders/:id/status') @ApiBody({ type: D.OrderStatusDto }) status(@Param('id') id: string, @Body(new D.DtoPipe(D.OrderStatusDto)) data: D.OrderStatusDto) { return this.s.status(id, data); }
  @Post('orders/:id/tags') @ApiBody({ type: D.AssignDto }) assign(@Param('id') id: string, @Body(new D.DtoPipe(D.AssignDto)) data: D.AssignDto) { return this.s.assign(id, data); }
  @Get('tags') tags() { return this.s.adminTags(); }
  @Post('tags/:id/activation-code') regenerateCode(@Param('id') id: string) { return this.s.regenerateActivationCode(id); }
  @Post('tags') create() { return this.s.batch(1); }
  @Post('tags/batch') @ApiBody({ type: D.BatchDto }) batch(@Body(new D.DtoPipe(D.BatchDto)) data: D.BatchDto) { return this.s.batch(data.quantity); }
  @Patch('tags/:id/status') @ApiBody({ type: D.TagStatusDto }) tagStatus(@Param('id') id: string, @Body(new D.DtoPipe(D.TagStatusDto)) data: D.TagStatusDto) { return this.s.tagStatus(id, data); }
  @Post('tags/:id/replace') @ApiBody({ type: D.ReplaceDto }) replace(@Param('id') id: string, @Body(new D.DtoPipe(D.ReplaceDto)) data: D.ReplaceDto) { return this.s.replace(id, data); }
  @Get('tags/:id/qr') async qr(@Param('id') id: string, @Res() res: Response) {
    const tag = await Tag.findById(objectId(id)); if (!tag) throw new NotFoundException();
    const buffer = await QRCode.toBuffer(`${process.env.FRONTEND_URL}/t/${tag.publicToken}`, { width: 600, margin: 3, errorCorrectionLevel: 'H' });
    res.type('png').setHeader('Content-Disposition', `attachment; filename="${tag.tagCode}.png"`); res.send(buffer);
  }
  @Get('users') async users() { return (await User.find().sort({ createdAt: -1 }).limit(200)).map(safeUser); }
  @Get('pets') pets() { return Pet.find().populate('ownerId', 'firstName lastName email').sort({ createdAt: -1 }).limit(200); }
  @Get('finder-reports') reports() { return FinderReport.find().populate('petId', 'name').sort({ createdAt: -1 }).limit(200); }
  @Get('products') products() { return Product.find().sort({ createdAt: 1 }); }
  @Post('products') @ApiBody({ type: D.ProductDto }) createProduct(@Body(new D.DtoPipe(D.ProductDto)) data: D.ProductDto) { return Product.create(data); }
  @Patch('products/:id') @ApiBody({ type: D.ProductDto }) async updateProduct(@Param('id') id: string, @Body(new D.DtoPipe(D.ProductDto)) data: D.ProductDto) { const p = await Product.findByIdAndUpdate(objectId(id), { $set: data }, { new: true, runValidators: true }); if (!p) throw new NotFoundException(); return p; }
}
@Controller()
export class HealthController {
  @Get('health') health() { return { status: 'ok', service: 'wooblet-api' }; }
  @Get('config') config() { return { shippingFee: Number(process.env.SHIPPING_FEE ?? 99), currency: 'PHP' }; }
}
