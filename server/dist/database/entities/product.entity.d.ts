export declare class Product {
    productId: number;
    name: string;
    price: number;
    description: string;
    reviews: number;
    previousPrice: number | null;
    urlImg: string;
    images: string[];
    isActive: boolean;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}
