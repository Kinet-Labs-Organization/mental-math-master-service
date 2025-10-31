import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Prisma, OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GetUser } from '@/src/auth/decorator';
import { JwtGuard } from '@/src/auth/guard';
import { AccessTokenUserDto } from '@/src/auth/dto';

@ApiTags('Orders')
@UseGuards(JwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  async create(
    @Body() createOrderDto: Prisma.OrderCreateInput,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the vendor' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'userId', required: false, type: String })
  async findAll(
    @GetUser() user: AccessTokenUserDto,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('status') status?: OrderStatus,
    @Query('userId') userId?: string,
  ) {
    return this.orderService.findAll(user, {
      skip,
      take,
      status,
      userId,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics for the vendor' })
  @ApiResponse({ status: 200, description: 'Return order statistics.' })
  async getStats(@GetUser() user: AccessTokenUserDto) {
    return this.orderService.getOrderStats(user);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent orders for the vendor' })
  @ApiResponse({ status: 200, description: 'Return recent orders.' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecent(
    @GetUser() user: AccessTokenUserDto,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.orderService.getRecentOrders(user, limit);
  }

  @Get('order-number/:orderNumber')
  @ApiOperation({ summary: 'Get an order by order number' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.findByOrderNumber(orderNumber, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: 200, description: 'Order successfully updated.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: Prisma.OrderUpdateInput,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.update(id, updateOrderDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status successfully updated.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.updateStatus(id, status, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 200, description: 'Order successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: AccessTokenUserDto
  ) {
    return this.orderService.remove(id, user);
  }
}