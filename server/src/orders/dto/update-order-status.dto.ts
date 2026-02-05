import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../database/entities';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
