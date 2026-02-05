import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PAID = "paid",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: number;
    total: number;
    status: OrderStatus;
    contactEmail: string;
    billingFirstName: string;
    billingLastName: string;
    billingDocument: string;
    billingPhone: string;
    billingCountry: string;
    billingCity: string;
    billingAddress: string;
    billingEmail: string;
    shippingFirstName: string;
    shippingLastName: string;
    shippingDocument: string;
    shippingPhone: string;
    shippingCountry: string;
    shippingCity: string;
    shippingAddress: string;
    shippingEmail: string;
    shipToDifferentAddress: boolean;
    paymentReference: string;
    paymentMethod: string;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
