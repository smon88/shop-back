import {
  IsString,
  IsNumber,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  // Contact Information
  @IsEmail()
  contactEmail: string;

  // Billing Information
  @IsString()
  @MaxLength(100)
  billingFirstName: string;

  @IsString()
  @MaxLength(100)
  billingLastName: string;

  @IsString()
  @MaxLength(50)
  billingDocument: string;

  @IsString()
  @MaxLength(20)
  billingPhone: string;

  @IsString()
  @MaxLength(100)
  billingCountry: string;

  @IsString()
  @MaxLength(100)
  billingCity: string;

  @IsString()
  @MaxLength(255)
  billingAddress: string;

  @IsEmail()
  billingEmail: string;

  // Shipping Information (optional)
  @IsBoolean()
  @IsOptional()
  shipToDifferentAddress?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingFirstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingLastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  shippingDocument?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  shippingPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingCountry?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  shippingAddress?: string;

  @IsEmail()
  @IsOptional()
  shippingEmail?: string;

  // Order Items
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
