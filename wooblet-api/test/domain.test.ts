import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicPet, assertOrderTransition, priceItems } from '../src/domain';
import { DtoPipe, FoundDto, OrderDto } from '../src/dto';
test('public pet privacy prevents contact, medical, owner and address disclosure', () => {
  const pet = { _id: 'private-id', ownerId: 'private-owner', name: 'Cooper', species: 'Dog', breed: 'Retriever', birthday: new Date('2020-01-01'), shippingAddress: { addressLine: 'private home' }, contact: { phone: 'secret', email: 'secret', ownerName: 'secret' }, medical: { allergies: 'secret' }, privacy: { showBreed: true }, lostMode: { active: false, message: 'private inactive message' } };
  const view = publicPet(pet);
  assert.equal(view.name, 'Cooper'); assert.equal(view.breed, 'Retriever');
  assert.deepEqual(view.contact, {}); assert.deepEqual(view.lostMode, { active: false });
  for (const key of ['_id', 'ownerId', 'medical', 'birthday', 'shippingAddress']) assert.equal(key in view, false);
  const enabled = publicPet({ ...pet, privacy: { showPhone: true, showMedicalNotes: true } });
  assert.equal(enabled.contact.phone, 'secret'); assert.equal(enabled.medical.allergies, 'secret'); assert.equal(enabled.contact.email, undefined);
});
test('orders cannot skip production steps or process unpaid orders', () => {
  assert.throws(() => assertOrderTransition('AWAITING_PAYMENT', 'IN_PRODUCTION', 'AWAITING_PAYMENT'));
  assert.throws(() => assertOrderTransition('PAID', 'IN_PRODUCTION', 'PAYMENT_ISSUE'));
  assert.throws(() => assertOrderTransition('COMPLETED', 'CANCELLED', 'PAID'));
  assert.doesNotThrow(() => assertOrderTransition('PAID', 'IN_PRODUCTION', 'PAID'));
  assert.doesNotThrow(() => assertOrderTransition('AWAITING_PAYMENT', 'CANCELLED', 'AWAITING_PAYMENT'));
});
test('pricing uses product records and validates customization', () => {
  const products = [{ _id: 'product', name: 'Paw', basePrice: 299, active: true, availableColors: ['Sage', 'Cream'], availableFonts: ['Rounded'] }];
  const item = { productId: 'product', unitPrice: 1, quantity: 2, customization: { primaryColor: 'Sage', secondaryColor: 'Cream', font: 'Rounded', petName: 'Cooper' } };
  assert.equal(priceItems([item], products)[0].unitPrice, 299);
  assert.throws(() => priceItems([{ ...item, customization: { ...item.customization, primaryColor: 'Invalid' } }], products));
  assert.throws(() => priceItems([item], [{ ...products[0], active: false }]));
});
test('nested DTOs reject missing locations, missing customer details and unknown fields', () => {
  assert.throws(() => new DtoPipe(FoundDto).transform({ consent: true }));
  assert.throws(() => new DtoPipe(FoundDto).transform({ consent: true, location: { latitude: 100, longitude: 0, accuracy: 1 } }));
  assert.throws(() => new DtoPipe(OrderDto).transform({ items: [] }));
  assert.throws(() => new DtoPipe(FoundDto).transform({ consent: true, ownerId: 'injected', location: { latitude: 0, longitude: 0, accuracy: 1 } }));
});
