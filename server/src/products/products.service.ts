import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities';
import { CreateProductDto, UpdateProductDto } from './dto';
import { create } from 'xmlbuilder2';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productId: id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { category, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findFeatured(limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      order: { reviews: 'DESC' },
      take: limit,
    });
  }

  async findOnSale(): Promise<Product[]> {
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

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('rss', {
        version: '2.0',
        'xmlns:g': 'http://base.google.com/ns/1.0',
      })
      .ele('channel');

    doc.ele('title').txt('Zentra Store').up();
    doc.ele('link').txt('https://zentrastorecolombia.com').up();
    doc.ele('description').txt('Catálogo de productos Zentra').up();

    for (const p of products) {
      const item = doc.ele('item');

      item.ele('g:id').txt(p.productId.toString()).up();
      item.ele('g:title').txt(p.name).up();
      item.ele('g:description').txt(p.description).up();
      item.ele('g:availability').txt('in stock').up();
      item.ele('g:condition').txt('new').up();
      item.ele('g:price').txt(`${p.price} COP`).up();
      item
        .ele('g:link')
        .txt(`https://zentrastorecolombia.com/products/${p.productId}`)
        .up();
      item.ele('g:image_link').txt(p.images[0]).up();
      item.ele('g:brand').txt('Zentra').up();

      item.up();
    }

    return doc.end({ prettyPrint: true });
  }
}
