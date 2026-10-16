import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Product } from './models.js';
async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI first.');
  await mongoose.connect(process.env.MONGODB_URI);
  // Signature colors from the product artwork, then the original pastels.
  const colors = ['Sunshine', 'Royal', 'Deep Blue', 'Vanilla', 'Cocoa', 'Bubblegum', 'Rose', 'White', 'Sage', 'Cream', 'Terracotta', 'Lilac', 'Ocean', 'Charcoal'];
  const designs = [ ['Paw', 'paw', 299, 'A little paw, a big connection. Our signature tag for your best friend.'], ['Bone', 'bone', 299, 'A playful classic, made for dogs with plenty of personality.'], ['Heart', 'heart', 329, 'For the little one who has your whole heart.'], ['Classic Round', 'round', 279, 'Simple, timeless, and ready for everyday adventures.'], ['Cat', 'cat', 299, 'A tiny companion for curious cats and their big adventures.'] ];
  for (const [name, design, basePrice, description] of designs) {
    await Product.updateOne({ slug: `wooblet-${design}` }, { $setOnInsert: { name: `Wooblet ${name}`, slug: `wooblet-${design}`, description, design, basePrice, images: [], availableColors: colors, availableFonts: ['Rounded', 'Classic', 'Playful'], active: true } }, { upsert: true });
    // Existing products keep their colors and gain any new palette colors.
    await Product.updateOne({ slug: `wooblet-${design}` }, { $addToSet: { availableColors: { $each: colors } } });
  }
  if (process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must have at least 12 characters.');
    await User.updateOne({ email: (process.env.ADMIN_EMAIL ?? 'admin@wooblet.local').toLowerCase() }, { $setOnInsert: { email: (process.env.ADMIN_EMAIL ?? 'admin@wooblet.local').toLowerCase(), firstName: 'Wooblet', lastName: 'Admin', passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'ADMIN', emailVerified: true } }, { upsert: true });
    console.log('Admin account created if it did not already exist.');
  }
  console.log('Five Wooblet designs are ready.');
  await mongoose.disconnect();
}
seed().catch(async e => { console.error(e.message); await mongoose.disconnect(); process.exit(1); });
