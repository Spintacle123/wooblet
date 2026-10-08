import 'reflect-metadata';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { bootstrap } from '../src/main';
import { User, Product, Tag } from '../src/models';
async function start() {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri(); process.env.PORT = '4400'; process.env.FRONTEND_URL = 'http://localhost:3300'; process.env.API_URL = 'http://localhost:4400'; process.env.NODE_ENV = 'test'; process.env.SMTP_HOST = ''; process.env.SHIPPING_FEE = '99';
  process.env.JWT_ACCESS_SECRET = randomBytes(32).toString('hex'); process.env.JWT_REFRESH_SECRET = randomBytes(32).toString('hex');
  const app = await bootstrap();
  await User.create({ email: 'studio@example.com', firstName: 'Studio', lastName: 'Admin', role: 'ADMIN', emailVerified: true, passwordHash: await bcrypt.hash('browser-test-password', 12) });
  for (const [name, design] of [['Paw', 'paw'], ['Bone', 'bone'], ['Heart', 'heart'], ['Classic Round', 'round'], ['Cat', 'cat']]) await Product.create({ name: `Wooblet ${name}`, slug: `wooblet-${design}`, design, description: 'A personalized little link home for your best friend.', basePrice: 299, active: true, availableColors: ['Sunshine', 'Royal', 'Deep Blue', 'Vanilla', 'Cocoa', 'Bubblegum', 'Rose', 'White', 'Sage', 'Cream', 'Terracotta', 'Lilac', 'Ocean', 'Charcoal'], availableFonts: ['Rounded', 'Classic', 'Playful'] });
  await Tag.create({ tagCode: 'WB-BROWSER', publicToken: 'browser-test-unclaimed-tag-token', status: 'UNCLAIMED', activationCodeHash: await bcrypt.hash('12345678', 12) });
  const stop = async () => { await app.close(); await mongoose.disconnect(); await mongo.stop(); process.exit(0); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
start().catch(e => { console.error(e); process.exit(1); });
