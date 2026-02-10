import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("../database/entities").Product>;
    findAll(): Promise<import("../database/entities").Product[]>;
    findFeatured(limit?: string): Promise<import("../database/entities").Product[]>;
    findOnSale(): Promise<import("../database/entities").Product[]>;
    facebookFeed(): Promise<{
        id: number;
        title: string;
        description: string;
        availability: string;
        condition: string;
        price: string;
        link: string;
        image_link: string;
        brand: string;
    }[]>;
    findByCategory(category: string): Promise<import("../database/entities").Product[]>;
    findOne(id: number): Promise<import("../database/entities").Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<import("../database/entities").Product>;
    remove(id: number): Promise<void>;
}
