import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, Role, SignUpMethod, Vendor } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AccessTokenUserDto } from '@/src/auth/dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) { }

  async createVendorAndVendorOwner(vendorCreateInput: Prisma.VendorCreateInput, vendorUserCreateInput: Omit<Prisma.VendorUserCreateInput, 'vendor'>) {
    /**
     * Business Logics Starts
     */

    // Ensure email uniqueness
    const existingVendor = await this.findOwnerByEmail(vendorUserCreateInput.email);
    if (existingVendor) {
      throw new UnprocessableEntityException('This email id is already used for another vendor');
    }

    /**
     * Business Logics Ends
     */

    // Use a transaction to ensure both operations succeed or fail together
    return this.prisma.$transaction(async (prisma) => {
      const vendorCreateInputDTO: Prisma.VendorCreateInput = {
        ...vendorCreateInput,
        isActive: true
      };

      const createdVendor = await prisma.vendor.create({
        data: {
          ...vendorCreateInputDTO,
          createdBy: vendorUserCreateInput.email,
          lastUpdatedBy: vendorUserCreateInput.email,
        },
      });

      const vendorUserCreateInputDTO: Prisma.VendorUserCreateInput = {
        ...vendorUserCreateInput,
        vendor: { connect: { id: createdVendor.id } },
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.OWNER,
        isActive: true
      };

      const createdVendorUser = await prisma.vendorUser.create({
        data: {
          ...vendorUserCreateInputDTO,
          createdBy: vendorUserCreateInput.email,
          lastUpdatedBy: vendorUserCreateInput.email,
        },
      });
      return { createdVendor, createdVendorUser };
    });
  }

  async createStaff(user: AccessTokenUserDto, vendorUserCreateInput: Omit<Prisma.VendorUserCreateInput, 'vendor'>) {
    /**
     * Business Logics Starts
     */

    // Ensure email uniqueness
    const existingVendor = await this.findIffOwnerByEmail(vendorUserCreateInput.email);
    if (existingVendor) {
      throw new UnprocessableEntityException('A vendor exists with this email id');
    }
    const existingStaff = await this.findStaffByEmail(vendorUserCreateInput.email, user);
    if (existingStaff) {
      throw new UnprocessableEntityException('Staff already created with this email id');
    }

    /**
     * Business Logics Ends
     */

    // Use a transaction to ensure both operations succeed or fail together
    return this.prisma.$transaction(async (prisma) => {
      const vendorUserCreateInputDTO: Prisma.VendorUserCreateInput = {
        ...vendorUserCreateInput,
        vendor: { connect: { id: user.vendorUUID } },
        signUpMethod: SignUpMethod.EMAIL,
        role: Role.STAFF,
        isActive: true
      };

      const createdVendorUser = await prisma.vendorUser.create({
        data: {
          ...vendorUserCreateInputDTO,
          createdBy: vendorUserCreateInput.email,
          lastUpdatedBy: vendorUserCreateInput.email,
        },
      });
      return { createdVendorUser };
    });
  }

  // async create(createVendorDto: Prisma.VendorCreateInput) {
  //   /**
  //    * Business Logics Starts
  //    */

  //   // Ensure email uniqueness
  //   const existingVendor = await this.prisma.vendor.findFirst({
  //     where: { email: createVendorDto.email },
  //   });
  //   if (existingVendor) {
  //     throw new Error('Email already in use');
  //   }

  //   /**
  //    * Business Logics Ends
  //    */

  //   const vendorDTO: Prisma.VendorCreateInput = {
  //     ...createVendorDto,
  //     signUpMethod: SignUpMethod.EMAIL,
  //     role: Role.VENDOR,
  //     isActive: true
  //   };

  //   return this.prisma.vendor.create({
  //     data: {
  //       ...vendorDTO,
  //       createdBy: createVendorDto.email,
  //       lastUpdatedBy: createVendorDto.email,
  //     },
  //   });
  // }

  // async createStaff(createVendorDto: Prisma.VendorCreateInput, vendor: Vendor) {
  //   const staffDTO: Prisma.VendorCreateInput = {
  //     ...createVendorDto,
  //     companyName: vendor.companyName,
  //     companyId: vendor.companyId,
  //     signUpMethod: SignUpMethod.EMAIL,
  //     role: Role.STAFF,
  //     isActive: true
  //   };
  //   return this.prisma.vendor.create({
  //     data: {
  //       ...staffDTO,
  //       createdBy: vendor.email,
  //       lastUpdatedBy: vendor.email,
  //     },
  //   });
  // }

  async findOwnerByEmail(email: string) {
    return this.prisma.vendorUser.findFirst({
      where: { email: email },
      include: {
        vendor: {
          select: {
            vendorId: true,
          }
        }
      }
    });
  }

  async findIffOwnerByEmail(email: string) {
    return this.prisma.vendorUser.findFirst({
      where: { email: email, role: Role.OWNER },
    });
  }

  async findStaffByEmail(email: string, user: AccessTokenUserDto) {
    return this.prisma.vendorUser.findFirst({
      where: { email: email, vendor: { id: user.vendorUUID } },
      include: {
        vendor: {
          select: {
            vendorId: true,
          }
        }
      }
    });
  }

  async findStaffByOnlyEmail(email: string, vendorId: string) {
    return this.prisma.vendorUser.findFirst({
      where: { email: email, vendor: { vendorId: vendorId } },
      include: {
        vendor: {
          select: {
            vendorId: true,
          }
        }
      }
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

  // async update(id: string, updateVendorDto: Prisma.VendorUpdateInput, vendor: Vendor) {
  //   try {
  //     const vendorUpdateInputAllowed = {
  //       name: updateVendorDto.name,
  //       companyName: updateVendorDto.companyName,
  //       phone: updateVendorDto.phone,
  //     };
  //     return await this.prisma.vendor.update({
  //       where: { id: vendor.id },
  //       data: {
  //         ...vendorUpdateInputAllowed,
  //         lastUpdatedBy: vendor.email,
  //       },
  //     });
  //   } catch (error) {
  //     if (error.code === 'P2025') {
  //       throw new NotFoundException(`Vendor with ID ${id} not found`);
  //     }
  //     throw error;
  //   }
  // }

  // async remove(id: string, vendor: Vendor) {
  //   const SOFT_DELETE = true; // Toggle soft delete
  //   try {
  //     // Soft delete is implemented as setting isActive to false
  //     if (SOFT_DELETE) {
  //       return this.prisma.vendor.updateMany({
  //         where: { id: vendor.id },
  //         data: { isActive: false },
  //       });
  //     } else {
  //       // Hard delete implementation
  //       return await this.prisma.vendor.delete({
  //         where: { id: vendor.id },
  //       });
  //     }
  //   } catch (error) {
  //     if (error.code === 'P2025') {
  //       throw new NotFoundException(`Vendor with ID ${id} not found`);
  //     }
  //     throw error;
  //   }
  // }
}