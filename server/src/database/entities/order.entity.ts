import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Contact Information
  @Column({ length: 255 })
  contactEmail: string;

  // Billing Information
  @Column({ length: 100 })
  billingFirstName: string;

  @Column({ length: 100 })
  billingLastName: string;

  @Column({ length: 50 })
  billingDocument: string;

  @Column({ length: 20 })
  billingPhone: string;

  @Column({ length: 100 })
  billingCountry: string;

  @Column({ length: 100 })
  billingCity: string;

  @Column({ length: 255 })
  billingAddress: string;

  @Column({ length: 255 })
  billingEmail: string;

  // Shipping Information (optional)
  @Column({ length: 100, nullable: true })
  shippingFirstName: string;

  @Column({ length: 100, nullable: true })
  shippingLastName: string;

  @Column({ length: 50, nullable: true })
  shippingDocument: string;

  @Column({ length: 20, nullable: true })
  shippingPhone: string;

  @Column({ length: 100, nullable: true })
  shippingCountry: string;

  @Column({ length: 100, nullable: true })
  shippingCity: string;

  @Column({ length: 255, nullable: true })
  shippingAddress: string;

  @Column({ length: 255, nullable: true })
  shippingEmail: string;

  @Column({ default: false })
  shipToDifferentAddress: boolean;

  // Payment Information (references only, not actual card data)
  @Column({ length: 50, nullable: true })
  paymentReference: string;

  @Column({ length: 50, nullable: true })
  paymentMethod: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
