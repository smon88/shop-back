import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Product, Order, OrderItem } from '../database/entities';

config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'zentra_shop',
  entities: [Product, Order, OrderItem],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
