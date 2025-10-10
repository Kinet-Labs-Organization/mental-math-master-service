import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createVendorDto: Prisma.VendorCreateInput) {
    return this.prisma.vendor.create({
      data: {
        ...createVendorDto,
        createdBy: createVendorDto.email,
        lastUpdatedBy: createVendorDto.email,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.vendor.findUnique({
      where: { email },
    });
  }

  // async findAll(query: {
  //   skip?: number;
  //   take?: number;
  //   companyId?: string;
  //   role?: string;
  //   isActive?: boolean
  // }) {
  //   const { skip, take, companyId, role, isActive } = query;

  //   const where: Prisma.VendorWhereInput = {
  //     ...(companyId && { companyId }),
  //     ...(role && { role: { equals: role as any } }),
  //     ...(typeof isActive === 'boolean' && { isActive }),
  //   };

  //   const [total, vendors] = await Promise.all([
  //     this.prisma.vendor.count({ where }),
  //     this.prisma.vendor.findMany({
  //       where,
  //       skip,
  //       take,
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     }),
  //   ]);

  //   return {
  //     data: vendors,
  //     meta: {
  //       total,
  //       skip,
  //       take,
  //     },
  //   };
  // }

  // async findOne(id: string) {
  //   const vendor = await this.prisma.vendor.findUnique({
  //     where: { id },
  //   });

  //   if (!vendor) {
  //     throw new NotFoundException(`Vendor with ID ${id} not found`);
  //   }

  //   return vendor;
  // }

  async update(id: string, updateVendorDto: Prisma.VendorUpdateInput, user: User) {
    try {
      const vendorUpdateInputAllowed = {
        name: updateVendorDto.name,
        companyName: updateVendorDto.companyName,
        phone: updateVendorDto.phone,
      };
      return await this.prisma.vendor.update({
        where: { id: user.id },
        data: {
          ...vendorUpdateInputAllowed,
          lastUpdatedBy: user.email,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string, user: User) {
    const SOFT_DELETE = true; // Toggle soft delete
    try {
      // Soft delete is implemented as setting isActive to false
      if (SOFT_DELETE) {
        return this.prisma.vendor.update({
          where: { id: user.id },
          data: { isActive: false },
        });
      } else {
        // Hard delete implementation
        return await this.prisma.vendor.delete({
          where: { id: user.id },
        });
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Vendor with ID ${id} not found`);
      }
      throw error;
    }
  }
}