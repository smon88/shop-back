export interface Product {
  productId: number;
  name: string;
  price: number;
  description: string;
  reviews: number;
  previousPrice: number | null;
  urlImg: string;
}
