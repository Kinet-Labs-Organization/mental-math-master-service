import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AccessTokenUserDto } from '@/src/auth/dto';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createProductDto: Prisma.ProductCreateInput, user: AccessTokenUserDto) {
        /**
         * Business Logic Starts
         */

        // Ensure SKU uniqueness within the vendor if provided
        if (createProductDto.sku) {
            const existingProduct = await this.prisma.product.findFirst({
                where: {
                    sku: createProductDto.sku,
                    vendorId: user.vendorUUID
                }
            });

            if (existingProduct) {
                throw new ConflictException(`Product with SKU ${createProductDto.sku} already exists`);
            }
        }

        /**
         * Business Logic Ends
         */

        const productCreateInputDTO: Prisma.ProductCreateInput = {
            ...createProductDto,
            vendor: { connect: { id: user.vendorUUID } },
            createdBy: user.userEmail,
            lastUpdatedBy: user.userEmail,
        };

        return this.prisma.product.create({
            data: productCreateInputDTO,
            include: {
                vendor: true,
                orderItems: true
            }
        });
    }

    async findAll(user: AccessTokenUserDto, query?: {
        skip?: number;
        take?: number;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const where: Prisma.ProductWhereInput = {
            vendorId: user.vendorUUID,
        };

        // Add search functionality
        if (query?.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        // Add price range filtering
        if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
            where.price = {};
            if (query?.minPrice !== undefined) {
                where.price.gte = query.minPrice;
            }
            if (query?.maxPrice !== undefined) {
                where.price.lte = query.maxPrice;
            }
        }

        // return this.prisma.product.findMany({
        //   where,
        //   skip: query?.skip || 0,
        //   take: query?.take || 10,
        //   include: {
        //     vendor: true,
        //     orderItems: {
        //       include: {
        //         order: true
        //       }
        //     }
        //   },
        //   orderBy: {
        //     createdAt: 'desc'
        //   }
        // });
        return this.prisma.product.findMany({
            where: { ...where, isActive: true },
            skip: query?.skip || 0,
            take: query?.take || 10,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(id: string, user: AccessTokenUserDto) {
        const product = await this.prisma.product.findFirst({
            where: {
                id,
                vendorId: user.vendorUUID
            },
            include: {
                vendor: true,
                orderItems: {
                    include: {
                        order: true
                    }
                }
            }
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    // async findBySku(sku: string, user: AccessTokenUserDto) {
    //     const product = await this.prisma.product.findFirst({
    //         where: {
    //             sku,
    //             vendorId: user.vendorUUID
    //         },
    //         include: {
    //             vendor: true,
    //             orderItems: {
    //                 include: {
    //                     order: true
    //                 }
    //             }
    //         }
    //     });

    //     if (!product) {
    //         throw new NotFoundException(`Product with SKU ${sku} not found`);
    //     }

    //     return product;
    // }

    async update(id: string, updateProductDto: Prisma.ProductUpdateInput, user: AccessTokenUserDto) {
        // First check if the product exists and belongs to the vendor
        const existingProduct = await this.findOne(id, user);

        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Check SKU uniqueness if SKU is being updated
        if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
            const duplicateProduct = await this.prisma.product.findFirst({
                where: {
                    sku: updateProductDto.sku as string,
                    vendorId: user.vendorUUID,
                    NOT: { id }
                }
            });

            if (duplicateProduct) {
                throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
            }
        }

        const updateProductDtoFinal: Prisma.ProductUpdateInput = {
            name: updateProductDto.name,
            description: updateProductDto.description,
            price: updateProductDto.price,
            quantity: updateProductDto.quantity,
            sku: updateProductDto.sku
        }

        return this.prisma.product.update({
            where: { id, vendorId: user.vendorUUID },
            data: {
                ...updateProductDtoFinal,
                lastUpdatedBy: user.userEmail,
            },
            include: {
                vendor: true,
                orderItems: {
                    include: {
                        order: true
                    }
                }
            }
        });
    }

    async remove(id: string, user: AccessTokenUserDto) {
        // First check if the product exists and belongs to the vendor
        const existingProduct = await this.findOne(id, user);

        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Check if product is used in any orders
        const orderItemsCount = await this.prisma.orderItem.count({
            where: { productId: id }
        });

        if (orderItemsCount > 0) {
            // throw new BadRequestException(
            //     'Cannot delete product that has been used in orders. Consider updating the product instead.'
            // );
            return this.prisma.product.update({
                where: { id, vendorId: user.vendorUUID },
                data: {
                    isActive: false,
                    lastUpdatedBy: user.userEmail,
                }
            });
        }

        try {
            return this.prisma.product.delete({
                where: { id, vendorId: user.vendorUUID },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            throw error;
        }
    }

    //   async getProductStats(user: AccessTokenUserDto) {
    //     const totalProducts = await this.prisma.product.count({
    //       where: { vendorId: user.vendorUUID }
    //     });

    //     const averagePrice = await this.prisma.product.aggregate({
    //       where: { vendorId: user.vendorUUID },
    //       _avg: {
    //         price: true
    //       }
    //     });

    //     const priceRange = await this.prisma.product.aggregate({
    //       where: { vendorId: user.vendorUUID },
    //       _min: {
    //         price: true
    //       },
    //       _max: {
    //         price: true
    //       }
    //     });

    //     const mostOrderedProducts = await this.prisma.product.findMany({
    //       where: { vendorId: user.vendorUUID },
    //       include: {
    //         orderItems: true,
    //         _count: {
    //           select: {
    //             orderItems: true
    //           }
    //         }
    //       },
    //       orderBy: {
    //         orderItems: {
    //           _count: 'desc'
    //         }
    //       },
    //       take: 5
    //     });

    //     return {
    //       totalProducts,
    //       averagePrice: averagePrice._avg.price,
    //       priceRange: {
    //         min: priceRange._min.price,
    //         max: priceRange._max.price
    //       },
    //       mostOrderedProducts
    //     };
    //   }

    //   async searchProducts(user: AccessTokenUserDto, searchTerm: string, limit: number = 10) {
    //     return this.prisma.product.findMany({
    //       where: {
    //         vendorId: user.vendorUUID,
    //         OR: [
    //           { name: { contains: searchTerm, mode: 'insensitive' } },
    //           { description: { contains: searchTerm, mode: 'insensitive' } },
    //           { sku: { contains: searchTerm, mode: 'insensitive' } }
    //         ]
    //       },
    //       take: limit,
    //       include: {
    //         vendor: true
    //       },
    //       orderBy: {
    //         name: 'asc'
    //       }
    //     });
    //   }

    //   async getLowStockProducts(user: AccessTokenUserDto, threshold: number = 10) {
    //     // Note: This is a placeholder since we don't have inventory/stock fields in the schema
    //     // In a real application, you would have stock quantity fields
    //     return this.prisma.product.findMany({
    //       where: {
    //         vendorId: user.vendorUUID,
    //         // Add stock quantity conditions here when available
    //       },
    //       include: {
    //         vendor: true
    //       }
    //     });
    //   }
}