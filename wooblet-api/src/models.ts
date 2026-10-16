import mongoose, { Schema } from 'mongoose';
const options = { timestamps: true, versionKey: false } as const;
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  firstName: String, lastName: String, phone: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  emailVerified: { type: Boolean, default: false },
  verificationHash: { type: String, select: false }, verificationExpiresAt: Date,
  resetHash: { type: String, select: false }, resetExpiresAt: Date,
}, options);
const sessionSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, tokenHash: { type: String, required: true, unique: true }, expiresAt: { type: Date, index: { expires: 0 } } }, options);
const petSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true }, species: { type: String, enum: ['Dog', 'Cat', 'Other'], required: true },
  breed: String, sex: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' }, birthday: Date,
  colorMarkings: String, photoUrl: String,
  medical: { allergies: String, conditions: String, medications: String, specialInstructions: String },
  contact: { ownerName: String, phone: String, alternatePhone: String, email: String, emergencyContact: String },
  privacy: {
    showPhoto: { type: Boolean, default: true }, showBreed: { type: Boolean, default: true },
    showSex: { type: Boolean, default: true }, showAge: { type: Boolean, default: true },
    showOwnerName: { type: Boolean, default: false }, showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false }, showMedicalNotes: { type: Boolean, default: false },
    showEmergencyContact: { type: Boolean, default: false },
  },
  lostMode: { active: { type: Boolean, default: false }, message: String, lastSeenAt: Date, lastSeenLocation: String, rewardMessage: String },
}, options);
const tagSchema = new Schema({
  tagCode: { type: String, required: true, unique: true }, publicToken: { type: String, required: true, unique: true },
  activationCodeHash: { type: String, select: false },
  activationCodeEncrypted: { type: String, select: false },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true }, petId: { type: Schema.Types.ObjectId, ref: 'Pet', index: true },
  status: { type: String, enum: ['UNASSIGNED', 'UNCLAIMED', 'ACTIVE', 'DISABLED', 'REPLACED'], default: 'UNASSIGNED' },
  activatedAt: Date, replacedByTagId: { type: Schema.Types.ObjectId, ref: 'Tag' }, orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
}, options);
const productSchema = new Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, description: String,
  basePrice: { type: Number, required: true, min: 1 }, images: [String], availableColors: [String], availableFonts: [String],
  design: { type: String, enum: ['paw', 'bone', 'heart', 'round', 'cat'], default: 'round' },
  active: { type: Boolean, default: true },
}, options);
const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true }, userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customer: { fullName: String, email: String, phone: String },
  shippingAddress: { addressLine: String, barangay: String, cityMunicipality: String, province: String, postalCode: String, notes: String },
  items: [{ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, productName: String, quantity: Number, unitPrice: Number,
    customization: { primaryColor: String, secondaryColor: String, rimColor: String, petName: String, font: String }, tagIds: [{ type: Schema.Types.ObjectId, ref: 'Tag' }] }],
  subtotal: Number, shippingFee: Number, total: Number,
  payment: { method: { type: String, default: 'QRPH' }, status: { type: String, enum: ['AWAITING_PAYMENT', 'PAYMENT_VERIFICATION', 'PAID', 'PAYMENT_ISSUE'], default: 'AWAITING_PAYMENT' }, verifiedAt: Date, verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' } },
  status: { type: String, enum: ['AWAITING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'COMPLETED', 'CANCELLED'], default: 'AWAITING_PAYMENT' },
  trackingNumber: String,
}, options);
const reportSchema = new Schema({
  tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true }, petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { latitude: Number, longitude: Number, accuracy: Number }, message: String,
}, options);
const scanSchema = new Schema({ tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true }, eventType: { type: String, default: 'PROFILE_VIEW' }, createdAt: { type: Date, default: Date.now, index: { expires: 7776000 } } });
const counterSchema = new Schema({ _id: String, sequence: { type: Number, default: 0 } });
export const User = mongoose.model('User', userSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const Pet = mongoose.model('Pet', petSchema);
export const Tag = mongoose.model('Tag', tagSchema);
export const Product = mongoose.model('Product', productSchema);
export const Order = mongoose.model('Order', orderSchema);
export const FinderReport = mongoose.model('FinderReport', reportSchema);
export const ScanEvent = mongoose.model('ScanEvent', scanSchema);
export const Counter = mongoose.model('Counter', counterSchema);
