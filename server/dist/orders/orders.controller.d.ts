import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<import("../database/entities").Order>;
    findAll(): Promise<import("../database/entities").Order[]>;
    findByEmail(email: string): Promise<import("../database/entities").Order[]>;
    findOne(id: number): Promise<import("../database/entities").Order>;
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto): Promise<import("../database/entities").Order>;
    cancel(id: number): Promise<import("../database/entities").Order>;
}
