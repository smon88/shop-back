import { Repository } from 'typeorm';
import { Product } from '../database/entities';
import { CreateProductDto, UpdateProductDto } from './dto';
export declare class ProductsService {
    private readonly productRepository;
    constructor(productRepository: Repository<Product>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    findByCategory(category: string): Promise<Product[]>;
    findFeatured(limit?: number): Promise<Product[]>;
    findOnSale(): Promise<Product[]>;
}
