import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '../entities';
export declare class SeedService implements OnModuleInit {
    private readonly productRepository;
    private readonly logger;
    constructor(productRepository: Repository<Product>);
    onModuleInit(): Promise<void>;
    private seedProducts;
}
