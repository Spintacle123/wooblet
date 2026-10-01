import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User, Session, Pet, Tag, Product, Order, FinderReport, ScanEvent, Counter } from './models';
import { hashToken, randomToken } from './security';
import { publicPet, assertOrderTransition, priceItems } from './domain';
import * as dto from './dto';
export const safeUser = (u: any) => ({ _id: u._id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone, createdAt: u.createdAt, role: u.role, emailVerified: u.emailVerified });
export function objectId(id: string) { if (!isValidObjectId(id)) throw new BadRequestException('Invalid identifier.'); return id; }
@Injectable()
export class AppService {
  async sendMail(email: string, kind: 'verify-email' | 'reset-password', token: string) {
    const url = `${process.env.FRONTEND_URL}/${kind}?token=${encodeURIComponent(token)}`;
    if (!process.env.SMTP_HOST) {
      if (process.env.NODE_ENV === 'production') throw new ServiceUnavailableException('Email service is not configured.');
      console.info(`[Development email] ${kind} for ${email}: ${url}`); return;
    }
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587), secure: process.env.SMTP_PORT === '465', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
    await transport.sendMail({ from: process.env.MAIL_FROM, to: email, subject: kind === 'verify-email' ? 'Verify your Wooblet email' : 'Reset your Wooblet password', text: `Open this link to ${kind === 'verify-email' ? 'verify your email' : 'reset your password'}: ${url}\nIf you did not request this, ignore this email.` });
  }
  async register(data: dto.RegisterDto) {
    if (Buffer.byteLength(data.password, 'utf8') > 72) throw new BadRequestException('Password must fit within 72 UTF-8 bytes. Use fewer characters.');
    const token = randomToken();
    let user;
    try { user = await User.create({ ...data, email: data.email.toLowerCase().trim(), passwordHash: await bcrypt.hash(data.password, 12), verificationHash: hashToken(token), verificationExpiresAt: new Date(Date.now() + 86400000) }); }
    catch (e: any) { if (e.code === 11000) throw new ConflictException('This email is already registered.'); throw e; }
    try { await this.sendMail(user.email, 'verify-email', token); } catch { console.error('Verification email delivery failed. User may request a new email.'); }
    return this.issueSession(user);
  }
  async login(data: dto.LoginDto) {
    if (Buffer.byteLength(data.password, 'utf8') > 72) throw new UnauthorizedException('Email or password is incorrect.');
    const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !await bcrypt.compare(data.password, user.passwordHash)) throw new UnauthorizedException('Email or password is incorrect.');
    return this.issueSession(user);
  }
  async issueSession(user: any) {
    const sid = randomToken();
    const refresh = jwt.sign({ sid }, process.env.JWT_REFRESH_SECRET!, { subject: String(user._id), expiresIn: '30d', algorithm: 'HS256' });
    const session = await Session.create({ userId: user._id, tokenHash: hashToken(refresh), expiresAt: new Date(Date.now() + 30 * 86400000) });
    const access = jwt.sign({ role: user.role, sessionId: String(session._id) }, process.env.JWT_ACCESS_SECRET!, { subject: String(user._id), expiresIn: '15m', algorithm: 'HS256' });
    return { user: safeUser(user), access, refresh };
  }
  async refresh(token?: string) {
    if (!token) throw new UnauthorizedException('Please sign in again.');
    let claims;
    try { claims = jwt.verify(token, process.env.JWT_REFRESH_SECRET!, { algorithms: ['HS256'] }) as jwt.JwtPayload; } catch { throw new UnauthorizedException('Please sign in again.'); }
    const session = await Session.findOneAndDelete({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
    if (!session || String(session.userId) !== claims.sub) throw new UnauthorizedException('Please sign in again.');
    const user = await User.findById(session.userId);
    if (!user) throw new UnauthorizedException();
    return this.issueSession(user);
  }
  async logout(token?: string) { if (token) await Session.deleteOne({ tokenHash: hashToken(token) }); return { message: 'Signed out.' }; }
  async forgot(data: dto.EmailDto) {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (user) { const token = randomToken(); await User.updateOne({ _id: user._id }, { $set: { resetHash: hashToken(token), resetExpiresAt: new Date(Date.now() + 3600000) } }); await this.sendMail(user.email, 'reset-password', token); }
    return { message: 'If that email is registered, a reset link has been sent.' };
  }
  async resend(id: string) {
    const user = await User.findById(id);
    if (!user || user.emailVerified) return { message: 'Email is already verified.' };
    const token = randomToken();
    await User.updateOne({ _id: id }, { $set: { verificationHash: hashToken(token), verificationExpiresAt: new Date(Date.now() + 86400000) } });
    await this.sendMail(user.email, 'verify-email', token);
    return { message: 'Verification email sent.' };
  }
  async verify(data: dto.TokenDto) {
    const user = await User.findOneAndUpdate({ verificationHash: hashToken(data.token), verificationExpiresAt: { $gt: new Date() } }, { $set: { emailVerified: true }, $unset: { verificationHash: 1, verificationExpiresAt: 1 } });
    if (!user) throw new BadRequestException('This verification link is invalid or expired.');
    return { message: 'Email verified. You can now sign in.' };
  }
  async reset(data: dto.ResetDto) {
    if (Buffer.byteLength(data.password, 'utf8') > 72) throw new BadRequestException('Password must fit within 72 UTF-8 bytes. Use fewer characters.');
    const user = await User.findOneAndUpdate({ resetHash: hashToken(data.token), resetExpiresAt: { $gt: new Date() } }, { $set: { passwordHash: await bcrypt.hash(data.password, 12) }, $unset: { resetHash: 1, resetExpiresAt: 1 } });
    if (!user) throw new BadRequestException('This reset link is invalid or expired.');
    await Session.deleteMany({ userId: user._id });
    return { message: 'Password updated. Please sign in.' };
  }
  async me(id: string) { const user = await User.findById(id); if (!user) throw new UnauthorizedException(); return safeUser(user); }
  async pet(id: string, ownerId: string) { const pet = await Pet.findOne({ _id: objectId(id), ownerId }); if (!pet) throw new NotFoundException('Pet not found.'); return pet; }
  async createPet(ownerId: string, data: dto.PetDto) { return Pet.create({ ...data, ownerId }); }
  async updatePet(id: string, ownerId: string, data: dto.PetDto) {
    const pet = await this.pet(id, ownerId);
    pet.set(data); await pet.save(); return pet;
  }
  async deletePet(id: string, ownerId: string) {
    await this.pet(id, ownerId);
    if (await Tag.exists({ petId: id, status: { $in: ['ACTIVE', 'DISABLED'] } })) throw new ConflictException('This pet has linked tags. Reassign them before deleting the profile.');
    await Pet.deleteOne({ _id: id, ownerId }); return { message: 'Pet deleted.' };
  }
  async ownerTag(id: string, ownerId: string) { const tag = await Tag.findOne({ _id: objectId(id), ownerId }); if (!tag) throw new NotFoundException('Tag not found.'); return tag; }
  async activate(token: string, ownerId: string, data: dto.ActivateDto) {
    const pet = await this.pet(data.petId, ownerId);
    const tag = await Tag.findOne({ publicToken: token, status: 'UNCLAIMED' }).select('+activationCodeHash');
    if (!tag || !tag.activationCodeHash || !await bcrypt.compare(data.activationCode, tag.activationCodeHash)) throw new BadRequestException('The activation code is incorrect or this tag is unavailable.');
    const activated = await Tag.findOneAndUpdate({ _id: tag._id, status: 'UNCLAIMED', ownerId: { $exists: false } }, { $set: { ownerId, petId: pet._id, status: 'ACTIVE', activatedAt: new Date() }, $unset: { activationCodeHash: 1 } }, { new: true });
    if (!activated) throw new ConflictException('This tag has already been claimed.');
    return activated;
  }
  async link(id: string, ownerId: string, data: dto.LinkDto) {
    const tag = await this.ownerTag(id, ownerId);
    if (tag.status !== 'ACTIVE' && tag.status !== 'DISABLED') throw new BadRequestException('This tag cannot be reassigned.');
    const pet = await this.pet(data.petId, ownerId);
    const updated = await Tag.findOneAndUpdate({ _id: tag._id, ownerId, status: { $in: ['ACTIVE', 'DISABLED'] }, replacedByTagId: { $exists: false } }, { $set: { petId: pet._id } }, { new: true });
    if (!updated) throw new ConflictException('This tag is being replaced or was updated.');
    return updated;
  }
  async publicTag(token: string) {
    const tag = await Tag.findOne({ publicToken: token });
    if (!tag || tag.status === 'UNASSIGNED') throw new NotFoundException('Wooblet not found.');
    if (tag.status === 'UNCLAIMED') return { status: 'UNCLAIMED', tagCode: tag.tagCode };
    if (tag.status !== 'ACTIVE') return { status: tag.status, tagCode: tag.tagCode };
    const pet = await Pet.findById(tag.petId).lean();
    if (!pet) throw new NotFoundException('Pet profile unavailable.');
    await ScanEvent.create({ tagId: tag._id });
    return { status: 'ACTIVE', tagCode: tag.tagCode, pet: publicPet(pet) };
  }
  async found(token: string, data: dto.FoundDto) {
    if (data.consent !== true) throw new BadRequestException('Location sharing requires consent.');
    const tag = await Tag.findOne({ publicToken: token, status: 'ACTIVE' });
    if (!tag || !tag.petId || !tag.ownerId) throw new NotFoundException('Active tag not found.');
    await FinderReport.create({ tagId: tag._id, petId: tag.petId, ownerId: tag.ownerId, location: data.location, message: data.message });
    return { message: 'Thank you. Your location was shared with the pet’s owner.' };
  }
  async createOrder(userId: string, data: dto.OrderDto) {
    const products = await Product.find({ _id: { $in: data.items.map(i => i.productId) }, active: true }).lean();
    const items = priceItems(data.items, products);
    const subtotal = Math.round(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;
    const shippingFee = Number(process.env.SHIPPING_FEE ?? 99);
    const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Manila' }).format(new Date());
    const counter = await Counter.findOneAndUpdate({ _id: `orders-${year}` }, { $inc: { sequence: 1 } }, { upsert: true, new: true });
    return Order.create({ ...data, userId, items, subtotal, shippingFee, total: Math.round((subtotal + shippingFee) * 100) / 100, orderNumber: `WB-${year}-${String(counter.sequence).padStart(6, '0')}` });
  }
  async order(number: string, userId: string) { const order = await Order.findOne({ orderNumber: number, userId }); if (!order) throw new NotFoundException('Order not found.'); return order; }
  async adminOrder(id: string) { const order = await Order.findById(objectId(id)); if (!order) throw new NotFoundException('Order not found.'); return order; }
  async payment(id: string, adminId: string, data: dto.PaymentDto) {
    const order = await this.adminOrder(id);
    if (order.status !== 'AWAITING_PAYMENT' || order.payment?.status === 'PAID') throw new BadRequestException('Payment cannot be changed for this order.');
    const update: any = { 'payment.status': data.status };
    if (data.status === 'PAID') Object.assign(update, { status: 'PAID', 'payment.verifiedAt': new Date(), 'payment.verifiedBy': adminId });
    const result = await Order.findOneAndUpdate({ _id: id, status: 'AWAITING_PAYMENT' }, { $set: update }, { new: true });
    if (!result) throw new ConflictException('Order was updated by another administrator.');
    return result;
  }
  async status(id: string, data: dto.OrderStatusDto) {
    const order = await this.adminOrder(id);
    assertOrderTransition(order.status!, data.status, order.payment?.status!);
    if (data.status === 'READY_TO_SHIP' && order.items.some(i => i.tagIds.length !== i.quantity)) throw new BadRequestException('Assign a tag to every item before marking ready to ship.');
    const updated = await Order.findOneAndUpdate({ _id: id, status: order.status }, { $set: { status: data.status, ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}) } }, { new: true });
    if (!updated) throw new ConflictException('Order was updated by another administrator.');
    return updated;
  }
  async batch(quantity: number) {
    const output = [];
    for (let i = 0; i < quantity; i++) {
      const activationCode = String(randomInt(0, 100000000)).padStart(8, '0');
      const publicToken = randomToken();
      const tag = await Tag.create({ tagCode: `WB-${randomToken().slice(0, 8).toUpperCase()}`, publicToken, activationCodeHash: await bcrypt.hash(activationCode, 12), status: 'UNASSIGNED' });
      output.push({ ...tag.toObject(), activationCode, publicUrl: `${process.env.FRONTEND_URL}/t/${publicToken}` });
    }
    return output.map(({ activationCodeHash, ...tag }) => tag);
  }
  async tagStatus(id: string, data: dto.TagStatusDto) {
    const allowed = data.status === 'DISABLED' ? ['ACTIVE', 'UNCLAIMED'] : ['DISABLED'];
    const tag = await Tag.findById(objectId(id));
    if (!tag || !allowed.includes(tag.status) || tag.replacedByTagId) throw new BadRequestException('Invalid tag status transition.');
    const nextStatus = data.status === 'ACTIVE' && !tag.petId ? 'UNCLAIMED' : data.status;
    const updated = await Tag.findOneAndUpdate({ _id: tag._id, status: tag.status, replacedByTagId: { $exists: false } }, { $set: { status: nextStatus } }, { new: true });
    if (!updated) throw new ConflictException('Tag was updated by another administrator.');
    return updated;
  }
  async assign(id: string, data: dto.AssignDto) {
    const order = await this.adminOrder(id);
    if (order.status !== 'IN_PRODUCTION') throw new BadRequestException('Tags can be assigned only during production.');
    const item = order.items.id(data.itemId);
    if (!item) throw new NotFoundException('Order item not found.');
    const tag = await Tag.findOneAndUpdate({ _id: objectId(data.tagId), status: 'UNASSIGNED', orderId: { $exists: false } }, { $set: { orderId: order._id } }, { new: true });
    if (!tag) throw new BadRequestException('This tag is already assigned or unavailable.');
    const updated = await Order.findOneAndUpdate({ _id: order._id, status: 'IN_PRODUCTION', items: { $elemMatch: { _id: item._id, [`tagIds.${(item.quantity ?? 0) - 1}`]: { $exists: false } } } }, { $push: { 'items.$.tagIds': tag._id } }, { new: true });
    if (!updated) { await Tag.updateOne({ _id: tag._id, orderId: order._id }, { $unset: { orderId: 1 } }); throw new ConflictException('This item already has enough tags or its order changed.'); }
    await Tag.updateOne({ _id: tag._id }, { $set: { status: 'UNCLAIMED' } });
    return updated;
  }
  async replace(id: string, data: dto.ReplaceDto) {
    if (id === data.replacementTagId) throw new BadRequestException('Choose a different replacement tag.');
    objectId(data.replacementTagId);
    const old = await Tag.findOneAndUpdate({ _id: objectId(id), status: 'ACTIVE', petId: { $exists: true }, ownerId: { $exists: true }, replacedByTagId: { $exists: false } }, { $set: { replacedByTagId: data.replacementTagId } }, { new: true });
    if (!old || !old.petId || !old.ownerId) throw new BadRequestException('Only an active linked tag can be replaced.');
    const replacement = await Tag.findOneAndUpdate({ _id: objectId(data.replacementTagId), status: { $in: ['UNASSIGNED', 'UNCLAIMED'] }, ownerId: { $exists: false }, orderId: { $exists: false } }, { $set: { ownerId: old.ownerId, petId: old.petId, status: 'ACTIVE', activatedAt: new Date() }, $unset: { activationCodeHash: 1 } }, { new: true });
    if (!replacement) {
      await Tag.updateOne({ _id: old._id, replacedByTagId: data.replacementTagId, status: 'ACTIVE' }, { $unset: { replacedByTagId: 1 } });
      throw new BadRequestException('Replacement must be an unowned, unallocated tag.');
    }
    await Tag.updateOne({ _id: old._id, replacedByTagId: replacement._id }, { $set: { status: 'REPLACED' } });
    return replacement;
  }
}
