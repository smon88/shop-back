"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let ProductsService = class ProductsService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async create(createProductDto) {
        const product = this.productRepository.create(createProductDto);
        return this.productRepository.save(product);
    }
    async findAll() {
        return this.productRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({
            where: { productId: id },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return this.productRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        product.isActive = false;
        await this.productRepository.save(product);
    }
    async findByCategory(category) {
        return this.productRepository.find({
            where: { category, isActive: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findFeatured(limit = 8) {
        return this.productRepository.find({
            where: { isActive: true },
            order: { reviews: 'DESC' },
            take: limit,
        });
    }
    async findOnSale() {
        return this.productRepository
            .createQueryBuilder('product')
            .where('product.isActive = :isActive', { isActive: true })
            .andWhere('product.previousPrice IS NOT NULL')
            .andWhere('product.previousPrice > product.price')
            .orderBy('product.createdAt', 'DESC')
            .getMany();
    }
    async facebookFeed() {
        const products = await this.findOnSale();
        return products.map((p) => ({
            id: p.productId,
            title: p.name,
            description: p.description,
            availability: 'in stock',
            condition: 'new',
            price: `${p.price} COP`,
            link: `https://zentrastorecolombia.com/products/${p.productId}`,
            image_link: p.images[0],
            brand: 'Zentra',
        }));
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map