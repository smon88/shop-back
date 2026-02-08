import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.seedProducts();
    }
  }

  private async seedProducts() {
    const count = await this.productRepository.count();

    if (count > 0) {
      this.logger.log('Products already seeded, skipping...');
      return;
    }

    const products: Partial<Product>[] = [
      {
        name: 'MacBook Pro 14" M3 Pro',
        price: 1999.99,
        previousPrice: 2299.99,
        description:
          '<p>El chip M3 Pro lleva la productividad profesional a otro nivel.</p><ul><li>Chip M3 Pro con CPU de 11 núcleos</li><li>18 GB de memoria unificada</li><li>512 GB de almacenamiento SSD</li><li>Pantalla Liquid Retina XDR</li></ul>',
        reviews: 156,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgk_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/macbook-pro.png',
        stock: 25,
        category: 'laptops',
        isActive: true,
      },
      {
        name: 'iPhone 15 Pro Max 256GB',
        price: 1199.99,
        previousPrice: null,
        description:
          '<p>El iPhone más avanzado hasta la fecha.</p><ul><li>Chip A17 Pro</li><li>Cámara de 48 MP</li><li>Titanio de grado aeroespacial</li><li>Action Button personalizable</li></ul>',
        reviews: 234,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhK9v8N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/iphone-15-pro.png',
        stock: 50,
        category: 'phones',
        isActive: true,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99,
        previousPrice: 1399.99,
        description:
          '<p>El smartphone Galaxy más potente.</p><ul><li>Procesador Snapdragon 8 Gen 3</li><li>Cámara de 200 MP</li><li>S Pen incluido</li><li>Galaxy AI integrado</li></ul>',
        reviews: 189,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgL_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/samsung-s24.png',
        stock: 35,
        category: 'phones',
        isActive: true,
      },
      {
        name: 'Sony WH-1000XM5',
        price: 349.99,
        previousPrice: 399.99,
        description:
          '<p>Audífonos con la mejor cancelación de ruido.</p><ul><li>Cancelación de ruido líder en la industria</li><li>30 horas de batería</li><li>Audio Hi-Res</li><li>Multipoint connection</li></ul>',
        reviews: 312,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgM_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/sony-wh1000xm5.png',
        stock: 100,
        category: 'audio',
        isActive: true,
      },
      {
        name: 'iPad Pro 12.9" M2',
        price: 1099.99,
        previousPrice: null,
        description:
          '<p>La tablet más potente del mercado.</p><ul><li>Chip M2</li><li>Pantalla Liquid Retina XDR</li><li>Compatible con Apple Pencil Pro</li><li>Face ID</li></ul>',
        reviews: 98,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgN_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/ipad-pro.png',
        stock: 40,
        category: 'tablets',
        isActive: true,
      },
      {
        name: 'Dell XPS 15 (2024)',
        price: 1799.99,
        previousPrice: 1999.99,
        description:
          '<p>Laptop premium para profesionales creativos.</p><ul><li>Intel Core i7-13700H</li><li>32 GB RAM</li><li>1 TB SSD</li><li>NVIDIA RTX 4060</li></ul>',
        reviews: 87,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgO_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/dell-xps.png',
        stock: 20,
        category: 'laptops',
        isActive: true,
      },
      {
        name: 'Nintendo Switch OLED',
        price: 349.99,
        previousPrice: null,
        description:
          '<p>La consola híbrida más versátil.</p><ul><li>Pantalla OLED de 7 pulgadas</li><li>64 GB de almacenamiento</li><li>Stand ajustable</li><li>Altavoces mejorados</li></ul>',
        reviews: 456,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgP_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/switch-oled.png',
        stock: 60,
        category: 'gaming',
        isActive: true,
      },
      {
        name: 'Apple Watch Series 9',
        price: 399.99,
        previousPrice: 449.99,
        description:
          '<p>El reloj más avanzado de Apple.</p><ul><li>Chip S9 SiP</li><li>Doble tap gesture</li><li>Pantalla Always-On</li><li>Sensor de oxígeno en sangre</li></ul>',
        reviews: 203,
        urlImg:
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQ_v9N6nXKG5r2J7qZvnPLnCvX7xKTQDKKBGn3H7zFGhpNvCPvD4R3FqKBzX6h3lL5C8F8m0YK8rA/s1600/apple-watch.png',
        stock: 75,
        category: 'wearables',
        isActive: true,
      },
    ];

    await this.productRepository.save(products);
    this.logger.log(`Seeded ${products.length} products`);
  }
}
