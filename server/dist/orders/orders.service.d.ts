import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Product } from '../database/entities';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderItemRepository;
    private readonly productRepository;
    private readonly dataSource;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, dataSource: DataSource);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    findByEmail(email: string): Promise<Order[]>;
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto): Promise<Order>;
    cancel(id: number): Promise<Order>;
}
