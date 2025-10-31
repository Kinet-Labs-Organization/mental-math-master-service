import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AccessTokenUserDto } from '@/src/auth/dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: Prisma.OrderCreateInput, user: AccessTokenUserDto) {
    /**
     * Business Logic Starts
     */

    // Since vendorId is handled through relation, we'll ensure vendor connection
    // No need to validate vendorId directly as it's handled through relation

    /**
     * Business Logic Ends
     */

    return this.prisma.$transaction(async (prisma) => {
      const orderCreateInputDTO: Prisma.OrderCreateInput = {
        ...createOrderDto,
        vendor: { connect: { id: user.vendorUUID } },
        createdBy: user.userEmail,
        lastUpdatedBy: user.userEmail,
      };

      const createdOrder = await prisma.order.create({
        data: orderCreateInputDTO,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          user: true,
          vendor: true
        }
      });

      return createdOrder;
    });
  }

  async findAll(user: AccessTokenUserDto, query?: {
    skip?: number;
    take?: number;
    status?: OrderStatus;
    userId?: string;
  }) {
    const where: Prisma.OrderWhereInput = {
      vendorId: user.vendorUUID,
    };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.userId) {
      where.userId = query.userId;
    }

    return this.prisma.order.findMany({
      where,
      skip: query?.skip || 0,
      take: query?.take || 10,
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        vendor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string, user: AccessTokenUserDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        vendorId: user.vendorUUID
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        vendor: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string, user: AccessTokenUserDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        vendorId: user.vendorUUID
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        vendor: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: Prisma.OrderUpdateInput, user: AccessTokenUserDto) {
    // First check if the order exists and belongs to the vendor
    const existingOrder = await this.findOne(id, user);

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        ...updateOrderDto,
        lastUpdatedBy: user.userEmail,
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        vendor: true
      }
    });
  }

  async updateStatus(id: string, status: OrderStatus, user: AccessTokenUserDto) {
    // First check if the order exists and belongs to the vendor
    const existingOrder = await this.findOne(id, user);

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        lastUpdatedBy: user.userEmail,
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true,
        vendor: true
      }
    });
  }

  async remove(id: string, user: AccessTokenUserDto) {
    const SOFT_DELETE = true; // Toggle soft delete

    // First check if the order exists and belongs to the vendor
    const existingOrder = await this.findOne(id, user);

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    try {
      if (SOFT_DELETE) {
        // Soft delete by updating status to CANCELLED
        return this.prisma.order.update({
          where: { id },
          data: { 
            status: OrderStatus.CANCELLED,
            lastUpdatedBy: user.userEmail,
          },
        });
      } else {
        // Hard delete implementation
        return this.prisma.order.delete({
          where: { id },
        });
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getOrderStats(user: AccessTokenUserDto) {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        vendorId: user.vendorUUID
      },
      _count: {
        status: true
      },
      _sum: {
        totalAmount: true
      }
    });

    return stats;
  }

  async getRecentOrders(user: AccessTokenUserDto, limit: number = 5) {
    return this.prisma.order.findMany({
      where: {
        vendorId: user.vendorUUID
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: true,
        user: true
      }
    });
  }
}