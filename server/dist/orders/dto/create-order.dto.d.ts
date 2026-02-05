export declare class OrderItemDto {
    productId: number;
    quantity: number;
}
export declare class CreateOrderDto {
    contactEmail: string;
    billingFirstName: string;
    billingLastName: string;
    billingDocument: string;
    billingPhone: string;
    billingCountry: string;
    billingCity: string;
    billingAddress: string;
    billingEmail: string;
    shipToDifferentAddress?: boolean;
    shippingFirstName?: string;
    shippingLastName?: string;
    shippingDocument?: string;
    shippingPhone?: string;
    shippingCountry?: string;
    shippingCity?: string;
    shippingAddress?: string;
    shippingEmail?: string;
    items: OrderItemDto[];
}
