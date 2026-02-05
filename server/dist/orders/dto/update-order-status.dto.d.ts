import { OrderStatus } from '../../database/entities';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    paymentReference?: string;
    paymentMethod?: string;
}
