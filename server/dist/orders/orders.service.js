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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../database/entities");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    productRepository;
    dataSource;
    constructor(orderRepository, orderItemRepository, productRepository, dataSource) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.dataSource = dataSource;
    }
    async create(createOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let total = 0;
            const orderItems = [];
            for (const item of createOrderDto.items) {
                const product = await this.productRepository.findOne({
                    where: { productId: item.productId, isActive: true },
                });
                if (!product) {
                    throw new common_1.BadRequestException(`Product with ID ${item.productId} not found or not available`);
                }
                if (product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
                }
                const subtotal = Number(product.price) * item.quantity;
                total += subtotal;
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: Number(product.price),
                    subtotal,
                });
                product.stock -= item.quantity;
                await queryRunner.manager.save(product);
            }
            const order = this.orderRepository.create({
                ...createOrderDto,
                total,
                status: entities_1.OrderStatus.PENDING,
            });
            const savedOrder = await queryRunner.manager.save(order);
            for (const item of orderItems) {
                const orderItem = this.orderItemRepository.create({
                    ...item,
                    orderId: savedOrder.id,
                });
                await queryRunner.manager.save(orderItem);
            }
            await queryRunner.commitTransaction();
            return this.findOne(savedOrder.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        return this.orderRepository.find({
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'items.product'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async findByEmail(email) {
        return this.orderRepository.find({
            where: { contactEmail: email },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, updateStatusDto) {
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
    async cancel(id) {
        const order = await this.findOne(id);
        if (order.status === entities_1.OrderStatus.SHIPPED || order.status === entities_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('Cannot cancel a shipped or delivered order');
        }
        for (const item of order.items) {
            const product = await this.productRepository.findOne({
                where: { productId: item.productId },
            });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }
        order.status = entities_1.OrderStatus.CANCELLED;
        return this.orderRepository.save(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map