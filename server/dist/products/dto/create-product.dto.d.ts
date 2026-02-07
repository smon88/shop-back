export declare class CreateProductDto {
    name: string;
    price: number;
    description?: string;
    reviews?: number;
    previousPrice?: number;
    urlImg: string;
    images?: string[];
    isActive?: boolean;
    stock?: number;
    category?: string;
}
