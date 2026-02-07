export interface Product {
  productId: number;
  name: string;
  price: number;
  description: string;
  reviews: number;
  previousPrice: number | null;
  urlImg: string;
  images?: string[];
  isActive?: boolean;
  stock?: number;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
  reviews?: number;
  previousPrice?: number | null;
  urlImg: string;
  images?: string[];
  stock?: number;
  category?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
