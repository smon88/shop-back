import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  productId: number;

  @Column({ length: 255 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  reviews: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previousPrice: number | null;

  @Column({ length: 500 })
  urlImg: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  stock: number;

  @Column({ length: 100, nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
