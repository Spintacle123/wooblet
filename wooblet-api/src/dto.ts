import { ApiProperty } from '@nestjs/swagger';
import { BadRequestException, PipeTransform } from '@nestjs/common';
import { plainToInstance, Type } from 'class-transformer';
import { validateSync, IsEmail, IsString, MinLength, MaxLength, IsOptional, IsIn, IsBoolean, IsNumber, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, ValidateNested, IsMongoId, IsInt, Matches, IsDateString, IsUrl, IsDefined } from 'class-validator';
export class DtoPipe implements PipeTransform {
  constructor(private readonly type: new () => object) {}
  transform(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('A JSON object is required.');
    const dto = plainToInstance(this.type, value);
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) throw new BadRequestException(errors.map(e => Object.values(e.constraints ?? {}).join(', ') || `${e.property} contains invalid values.`));
    return dto;
  }
}
export class RegisterDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(10) @MaxLength(72) password!: string;
  @IsString() @MinLength(1) @MaxLength(60) firstName!: string;
  @IsString() @MinLength(1) @MaxLength(60) lastName!: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
}
export class LoginDto { @IsEmail() email!: string; @IsString() @MaxLength(72) password!: string; }
export class EmailDto { @IsEmail() email!: string; }
export class TokenDto { @IsString() @MinLength(20) @MaxLength(256) token!: string; }
export class ResetDto extends TokenDto { @IsString() @MinLength(10) @MaxLength(72) password!: string; }
class MedicalDto {
  @IsOptional() @IsString() @MaxLength(1000) allergies?: string;
  @IsOptional() @IsString() @MaxLength(1000) conditions?: string;
  @IsOptional() @IsString() @MaxLength(1000) medications?: string;
  @IsOptional() @IsString() @MaxLength(1000) specialInstructions?: string;
}
class ContactDto {
  @IsOptional() @IsString() @MaxLength(100) ownerName?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsString() @MaxLength(30) alternatePhone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(200) emergencyContact?: string;
}
class PrivacyDto {
  @IsOptional() @IsBoolean() showPhoto?: boolean;
  @IsOptional() @IsBoolean() showBreed?: boolean;
  @IsOptional() @IsBoolean() showSex?: boolean;
  @IsOptional() @IsBoolean() showAge?: boolean;
  @IsOptional() @IsBoolean() showOwnerName?: boolean;
  @IsOptional() @IsBoolean() showPhone?: boolean;
  @IsOptional() @IsBoolean() showEmail?: boolean;
  @IsOptional() @IsBoolean() showMedicalNotes?: boolean;
  @IsOptional() @IsBoolean() showEmergencyContact?: boolean;
}
class LostDto {
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) message?: string;
  @IsOptional() @IsDateString() lastSeenAt?: string;
  @IsOptional() @IsString() @MaxLength(200) lastSeenLocation?: string;
  @IsOptional() @IsString() @MaxLength(200) rewardMessage?: string;
}
export class PetDto {
  @IsString() @MinLength(1) @MaxLength(60) name!: string;
  @IsIn(['Dog', 'Cat', 'Other']) species!: string;
  @IsOptional() @IsString() @MaxLength(100) breed?: string;
  @IsOptional() @IsIn(['Male', 'Female', 'Unknown']) sex?: string;
  @IsOptional() @IsDateString() birthday?: string;
  @IsOptional() @IsString() @MaxLength(300) colorMarkings?: string;
  @IsOptional() @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true }) photoUrl?: string;
  @IsOptional() @ValidateNested() @Type(() => MedicalDto) medical?: MedicalDto;
  @IsOptional() @ValidateNested() @Type(() => ContactDto) contact?: ContactDto;
  @IsOptional() @ValidateNested() @Type(() => PrivacyDto) privacy?: PrivacyDto;
  @IsOptional() @ValidateNested() @Type(() => LostDto) lostMode?: LostDto;
}
export class ActivateDto {
  @IsString() @Matches(/^\d{8}$/) activationCode!: string;
  @IsMongoId() petId!: string;
}
export class LinkDto { @IsMongoId() petId!: string; }
class LocationDto {
  @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNumber() @Min(-180) @Max(180) longitude!: number;
  @IsNumber() @Min(0) @Max(100000) accuracy!: number;
}
export class FoundDto {
  @IsBoolean() consent!: boolean;
  @IsDefined() @ValidateNested() @Type(() => LocationDto) location!: LocationDto;
  @IsOptional() @IsString() @MaxLength(1000) message?: string;
}
class CustomerDto {
  @IsString() @MinLength(1) @MaxLength(120) fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) @MaxLength(30) phone!: string;
}
class AddressDto {
  @IsString() @MinLength(1) @MaxLength(200) addressLine!: string;
  @IsString() @MinLength(1) @MaxLength(100) barangay!: string;
  @IsString() @MinLength(1) @MaxLength(100) cityMunicipality!: string;
  @IsString() @MinLength(1) @MaxLength(100) province!: string;
  @IsString() @Matches(/^\d{4}$/) postalCode!: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}
class CustomizationDto {
  @IsString() @MaxLength(40) primaryColor!: string;
  @IsString() @MaxLength(40) secondaryColor!: string;
  /** Optional so orders placed before the rim picker existed stay valid. */
  @IsOptional() @IsString() @MaxLength(40) rimColor?: string;
  @IsString() @MinLength(1) @MaxLength(16) petName!: string;
  @IsString() @MaxLength(40) font!: string;
}
class ItemDto {
  @IsMongoId() productId!: string;
  @IsInt() @Min(1) @Max(20) quantity!: number;
  @IsDefined() @ValidateNested() @Type(() => CustomizationDto) customization!: CustomizationDto;
}
export class OrderDto {
  @IsDefined() @ValidateNested() @Type(() => CustomerDto) customer!: CustomerDto;
  @IsDefined() @ValidateNested() @Type(() => AddressDto) shippingAddress!: AddressDto;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ItemDto) items!: ItemDto[];
}
export class PaymentDto { @IsIn(['PAYMENT_VERIFICATION', 'PAID', 'PAYMENT_ISSUE']) status!: string; }
export class OrderStatusDto {
  @IsIn(['IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'COMPLETED', 'CANCELLED']) status!: string;
  @IsOptional() @IsString() @MaxLength(120) trackingNumber?: string;
}
export class BatchDto { @IsInt() @Min(1) @Max(100) quantity!: number; }
export class TagStatusDto { @IsIn(['DISABLED', 'ACTIVE']) status!: string; }
export class ReplaceDto { @IsMongoId() replacementTagId!: string; }
export class AssignDto { @IsMongoId() tagId!: string; @IsString() itemId!: string; }
export class ProductDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(100) slug!: string;
  @IsString() @MaxLength(2000) description!: string;
  @IsNumber() @Min(1) @Max(100000) basePrice!: number;
  @IsIn(['paw', 'bone', 'heart', 'round', 'cat']) design!: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @IsString({ each: true }) availableColors!: string[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(10) @IsString({ each: true }) availableFonts!: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUrl({ require_tld: false, protocols: ['http', 'https'], require_protocol: true }, { each: true }) images?: string[];
  @IsBoolean() active!: boolean;
}

ApiProperty({ type: () => String, required: true })(RegisterDto.prototype, 'email');
ApiProperty({ type: () => String, required: true })(RegisterDto.prototype, 'password');
ApiProperty({ type: () => String, required: true })(RegisterDto.prototype, 'firstName');
ApiProperty({ type: () => String, required: true })(RegisterDto.prototype, 'lastName');
ApiProperty({ type: () => String, required: false })(RegisterDto.prototype, 'phone');
ApiProperty({ type: () => String, required: true })(LoginDto.prototype, 'email');
ApiProperty({ type: () => String, required: true })(LoginDto.prototype, 'password');
ApiProperty({ type: () => String, required: true })(EmailDto.prototype, 'email');
ApiProperty({ type: () => String, required: true })(TokenDto.prototype, 'token');
ApiProperty({ type: () => String, required: true })(ResetDto.prototype, 'password');
ApiProperty({ type: () => String, required: false })(MedicalDto.prototype, 'allergies');
ApiProperty({ type: () => String, required: false })(MedicalDto.prototype, 'conditions');
ApiProperty({ type: () => String, required: false })(MedicalDto.prototype, 'medications');
ApiProperty({ type: () => String, required: false })(MedicalDto.prototype, 'specialInstructions');
ApiProperty({ type: () => String, required: false })(ContactDto.prototype, 'ownerName');
ApiProperty({ type: () => String, required: false })(ContactDto.prototype, 'phone');
ApiProperty({ type: () => String, required: false })(ContactDto.prototype, 'alternatePhone');
ApiProperty({ type: () => String, required: false })(ContactDto.prototype, 'email');
ApiProperty({ type: () => String, required: false })(ContactDto.prototype, 'emergencyContact');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showPhoto');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showBreed');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showSex');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showAge');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showOwnerName');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showPhone');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showEmail');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showMedicalNotes');
ApiProperty({ type: () => Boolean, required: false })(PrivacyDto.prototype, 'showEmergencyContact');
ApiProperty({ type: () => Boolean, required: false })(LostDto.prototype, 'active');
ApiProperty({ type: () => String, required: false })(LostDto.prototype, 'message');
ApiProperty({ type: () => String, required: false })(LostDto.prototype, 'lastSeenAt');
ApiProperty({ type: () => String, required: false })(LostDto.prototype, 'lastSeenLocation');
ApiProperty({ type: () => String, required: false })(LostDto.prototype, 'rewardMessage');
ApiProperty({ type: () => String, required: true })(PetDto.prototype, 'name');
ApiProperty({ type: () => String, required: true })(PetDto.prototype, 'species');
ApiProperty({ type: () => String, required: false })(PetDto.prototype, 'breed');
ApiProperty({ type: () => String, required: false })(PetDto.prototype, 'sex');
ApiProperty({ type: () => String, required: false })(PetDto.prototype, 'birthday');
ApiProperty({ type: () => String, required: false })(PetDto.prototype, 'colorMarkings');
ApiProperty({ type: () => String, required: false })(PetDto.prototype, 'photoUrl');
ApiProperty({ type: () => MedicalDto, required: false })(PetDto.prototype, 'medical');
ApiProperty({ type: () => ContactDto, required: false })(PetDto.prototype, 'contact');
ApiProperty({ type: () => PrivacyDto, required: false })(PetDto.prototype, 'privacy');
ApiProperty({ type: () => LostDto, required: false })(PetDto.prototype, 'lostMode');
ApiProperty({ type: () => String, required: true })(ActivateDto.prototype, 'activationCode');
ApiProperty({ type: () => String, required: true })(ActivateDto.prototype, 'petId');
ApiProperty({ type: () => String, required: true })(LinkDto.prototype, 'petId');
ApiProperty({ type: () => Number, required: true })(LocationDto.prototype, 'latitude');
ApiProperty({ type: () => Number, required: true })(LocationDto.prototype, 'longitude');
ApiProperty({ type: () => Number, required: true })(LocationDto.prototype, 'accuracy');
ApiProperty({ type: () => Boolean, required: true })(FoundDto.prototype, 'consent');
ApiProperty({ type: () => LocationDto, required: true })(FoundDto.prototype, 'location');
ApiProperty({ type: () => String, required: false })(FoundDto.prototype, 'message');
ApiProperty({ type: () => String, required: true })(CustomerDto.prototype, 'fullName');
ApiProperty({ type: () => String, required: true })(CustomerDto.prototype, 'email');
ApiProperty({ type: () => String, required: true })(CustomerDto.prototype, 'phone');
ApiProperty({ type: () => String, required: true })(AddressDto.prototype, 'addressLine');
ApiProperty({ type: () => String, required: true })(AddressDto.prototype, 'barangay');
ApiProperty({ type: () => String, required: true })(AddressDto.prototype, 'cityMunicipality');
ApiProperty({ type: () => String, required: true })(AddressDto.prototype, 'province');
ApiProperty({ type: () => String, required: true })(AddressDto.prototype, 'postalCode');
ApiProperty({ type: () => String, required: false })(AddressDto.prototype, 'notes');
ApiProperty({ type: () => String, required: true })(CustomizationDto.prototype, 'primaryColor');
ApiProperty({ type: () => String, required: true })(CustomizationDto.prototype, 'secondaryColor');
ApiProperty({ type: () => String, required: false })(CustomizationDto.prototype, 'rimColor');
ApiProperty({ type: () => String, required: true })(CustomizationDto.prototype, 'petName');
ApiProperty({ type: () => String, required: true })(CustomizationDto.prototype, 'font');
ApiProperty({ type: () => String, required: true })(ItemDto.prototype, 'productId');
ApiProperty({ type: () => Number, required: true })(ItemDto.prototype, 'quantity');
ApiProperty({ type: () => CustomizationDto, required: true })(ItemDto.prototype, 'customization');
ApiProperty({ type: () => CustomerDto, required: true })(OrderDto.prototype, 'customer');
ApiProperty({ type: () => AddressDto, required: true })(OrderDto.prototype, 'shippingAddress');
ApiProperty({ type: () => ItemDto, required: true, isArray: true })(OrderDto.prototype, 'items');
ApiProperty({ type: () => String, required: true })(PaymentDto.prototype, 'status');
ApiProperty({ type: () => String, required: true })(OrderStatusDto.prototype, 'status');
ApiProperty({ type: () => String, required: false })(OrderStatusDto.prototype, 'trackingNumber');
ApiProperty({ type: () => Number, required: true })(BatchDto.prototype, 'quantity');
ApiProperty({ type: () => String, required: true })(TagStatusDto.prototype, 'status');
ApiProperty({ type: () => String, required: true })(ReplaceDto.prototype, 'replacementTagId');
ApiProperty({ type: () => String, required: true })(AssignDto.prototype, 'tagId');
ApiProperty({ type: () => String, required: true })(AssignDto.prototype, 'itemId');
ApiProperty({ type: () => String, required: true })(ProductDto.prototype, 'name');
ApiProperty({ type: () => String, required: true })(ProductDto.prototype, 'slug');
ApiProperty({ type: () => String, required: true })(ProductDto.prototype, 'description');
ApiProperty({ type: () => Number, required: true })(ProductDto.prototype, 'basePrice');
ApiProperty({ type: () => String, required: true })(ProductDto.prototype, 'design');
ApiProperty({ type: () => String, required: true, isArray: true })(ProductDto.prototype, 'availableColors');
ApiProperty({ type: () => String, required: true, isArray: true })(ProductDto.prototype, 'availableFonts');
ApiProperty({ type: () => String, required: false, isArray: true })(ProductDto.prototype, 'images');
ApiProperty({ type: () => Boolean, required: true })(ProductDto.prototype, 'active');
