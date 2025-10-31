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
    ParseFloatPipe,
    ValidationPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductService } from './product.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GetUser } from '@/src/auth/decorator';
import { JwtGuard } from '@/src/auth/guard';
import { AccessTokenUserDto } from '@/src/auth/dto';

@ApiTags('Products')
@UseGuards(JwtGuard)
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product successfully created.' })
    @ApiResponse({ status: 409, description: 'Product with SKU already exists.' })
    async create(
        @Body() createProductDto: Prisma.ProductCreateInput,
        @GetUser() user: AccessTokenUserDto
    ) {
        return this.productService.create(createProductDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products for the vendor' })
    @ApiResponse({ status: 200, description: 'Return all products.' })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'minPrice', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    async findAll(
        @GetUser() user: AccessTokenUserDto,
        @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
        @Query('take', new ParseIntPipe({ optional: true })) take?: number,
        @Query('search') search?: string,
        @Query('minPrice', new ParseFloatPipe({ optional: true })) minPrice?: number,
        @Query('maxPrice', new ParseFloatPipe({ optional: true })) maxPrice?: number,
    ) {
        return this.productService.findAll(user, {
            skip,
            take,
            search,
            minPrice,
            maxPrice,
        });
    }

    //   @Get('stats')
    //   @ApiOperation({ summary: 'Get product statistics for the vendor' })
    //   @ApiResponse({ status: 200, description: 'Return product statistics.' })
    //   async getStats(@GetUser() user: AccessTokenUserDto) {
    //     return this.productService.getProductStats(user);
    //   }

    //   @Get('search')
    //   @ApiOperation({ summary: 'Search products by name, description, or SKU' })
    //   @ApiResponse({ status: 200, description: 'Return matching products.' })
    //   @ApiQuery({ name: 'q', required: true, type: String })
    //   @ApiQuery({ name: 'limit', required: false, type: Number })
    //   async search(
    //     @GetUser() user: AccessTokenUserDto,
    //     @Query('q') searchTerm: string,
    //     @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    //   ) {
    //     return this.productService.searchProducts(user, searchTerm, limit);
    //   }

    //   @Get('low-stock')
    //   @ApiOperation({ summary: 'Get products with low stock' })
    //   @ApiResponse({ status: 200, description: 'Return products with low stock.' })
    //   @ApiQuery({ name: 'threshold', required: false, type: Number })
    //   async getLowStock(
    //     @GetUser() user: AccessTokenUserDto,
    //     @Query('threshold', new ParseIntPipe({ optional: true })) threshold?: number,
    //   ) {
    //     return this.productService.getLowStockProducts(user, threshold);
    //   }

    //   @Get('sku/:sku')
    //   @ApiOperation({ summary: 'Get a product by SKU' })
    //   @ApiResponse({ status: 200, description: 'Return the product.' })
    //   @ApiResponse({ status: 404, description: 'Product not found.' })
    //   async findBySku(
    //     @Param('sku') sku: string,
    //     @GetUser() user: AccessTokenUserDto
    //   ) {
    //     return this.productService.findBySku(sku, user);
    //   }

    @Get(':id')
    @ApiOperation({ summary: 'Get a product by ID' })
    @ApiResponse({ status: 200, description: 'Return the product.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: AccessTokenUserDto
    ) {
        return this.productService.findOne(id, user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a product' })
    @ApiResponse({ status: 200, description: 'Product successfully updated.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    @ApiResponse({ status: 409, description: 'Product with SKU already exists.' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) updateProductDto: Prisma.ProductUpdateInput,
        @GetUser() user: AccessTokenUserDto
    ) {
        return this.productService.update(id, updateProductDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a product' })
    @ApiResponse({ status: 200, description: 'Product successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Product not found.' })
    @ApiResponse({ status: 400, description: 'Cannot delete product used in orders.' })
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @GetUser() user: AccessTokenUserDto
    ) {
        return this.productService.remove(id, user);
    }
}