import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  reviews?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  previousPrice?: number;

  @IsString()
  @MaxLength(500)
  urlImg: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(4)
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;
}
