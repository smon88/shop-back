import { Order } from './order.entity';
import { Product } from './product.entity';
export declare class OrderItem {
    id: number;
    order: Order;
    orderId: number;
    product: Product;
    productId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}
