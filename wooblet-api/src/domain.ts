import { BadRequestException } from '@nestjs/common';
export function publicPet(pet: any) {
  const p = pet.privacy ?? {};
  const result: Record<string, any> = { name: pet.name, species: pet.species, colorMarkings: pet.colorMarkings, lostMode: { active: !!pet.lostMode?.active } };
  if (p.showPhoto) result.photoUrl = pet.photoUrl;
  if (p.showBreed) result.breed = pet.breed;
  if (p.showSex) result.sex = pet.sex;
  if (p.showAge && pet.birthday) {
    const birth = new Date(pet.birthday); const now = new Date();
    result.age = Math.max(0, now.getFullYear() - birth.getFullYear() - (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0));
  }
  result.contact = {};
  if (p.showOwnerName) result.contact.ownerName = pet.contact?.ownerName;
  if (p.showPhone) { result.contact.phone = pet.contact?.phone; result.contact.alternatePhone = pet.contact?.alternatePhone; }
  if (p.showEmail) result.contact.email = pet.contact?.email;
  if (p.showEmergencyContact) result.contact.emergencyContact = pet.contact?.emergencyContact;
  if (p.showMedicalNotes) result.medical = pet.medical;
  if (pet.lostMode?.active) result.lostMode = pet.lostMode;
  return result;
}
export function assertOrderTransition(current: string, next: string, payment: string) {
  const transitions: Record<string, string[]> = { AWAITING_PAYMENT: ['CANCELLED'], PAID: ['IN_PRODUCTION', 'CANCELLED'], IN_PRODUCTION: ['READY_TO_SHIP', 'CANCELLED'], READY_TO_SHIP: ['SHIPPED', 'CANCELLED'], SHIPPED: ['COMPLETED'], COMPLETED: [], CANCELLED: [] };
  if (!transitions[current]?.includes(next)) throw new BadRequestException(`Cannot move an order from ${current} to ${next}.`);
  if (next !== 'CANCELLED' && payment !== 'PAID') throw new BadRequestException('Verify payment before processing the order.');
}
export function priceItems(requested: any[], products: any[]) {
  return requested.map(item => {
    const product = products.find(p => String(p._id) === item.productId && p.active);
    if (!product) throw new BadRequestException('A product is no longer available.');
    const c = item.customization;
    if (![c.primaryColor, c.secondaryColor, ...(c.rimColor === undefined ? [] : [c.rimColor])].every(color => product.availableColors.includes(color)) || !product.availableFonts.includes(c.font)) throw new BadRequestException(`Invalid customization for ${product.name}.`);
    return { productId: product._id, productName: product.name, quantity: item.quantity, unitPrice: product.basePrice, customization: c, tagIds: [] };
  });
}
