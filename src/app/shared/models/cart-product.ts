import { Product } from './product';

export interface CartProduct {
  productId: number;
  productName: string;
  productImg: string;
  productPrice: number;
  quantity: number;
}
