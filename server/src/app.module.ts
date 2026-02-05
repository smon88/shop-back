import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { SeedModule } from './database/seed/seed.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Serve Angular Frontend (production)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dist', 'frontend', 'browser'),
      exclude: ['/api*'],
    }),

    // Feature Modules
    ProductsModule,
    OrdersModule,

    // Database Seeding (development)
    SeedModule,
  ],
})
export class AppModule {}
