import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, OrderStatus, Product } from '../database/entities';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate products and calculate total
      let total = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productRepository.findOne({
          where: { productId: item.productId, isActive: true },
        });

        if (!product) {
          throw new BadRequestException(
            `Product with ID ${item.productId} not found or not available`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }

        const subtotal = Number(product.price) * item.quantity;
        total += subtotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(product.price),
          subtotal,
        });

        // Update stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);
      }

      // Create order
      const order = this.orderRepository.create({
        ...createOrderDto,
        total,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      for (const item of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          orderId: savedOrder.id,
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();

      // Return order with items
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByEmail(email: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { contactEmail: email },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    order.status = updateStatusDto.status;

    if (updateStatusDto.paymentReference) {
      order.paymentReference = updateStatusDto.paymentReference;
    }

    if (updateStatusDto.paymentMethod) {
      order.paymentMethod = updateStatusDto.paymentMethod;
    }

    return this.orderRepository.save(order);
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a shipped or delivered order');
    }

    // Restore stock
    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { productId: item.productId },
      });
      if (product) {
        product.stock += item.quantity;
        await this.productRepository.save(product);
      }
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
