import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { VendorService } from './vendor.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/src/auth/decorator';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor successfully created.' })
  async createVendor(@Body() createVendorDto: Prisma.VendorCreateInput) {
    return this.vendorService.create(createVendorDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Get all vendors' })
  // @ApiResponse({ status: 200, description: 'Return all vendors.' })
  // async findAll(
  //   @Query('skip') skip?: number,
  //   @Query('take') take?: number,
  //   @Query('companyId') companyId?: string,
  //   @Query('role') role?: string,
  //   @Query('isActive') isActive?: boolean,
  // ) {
  //   return this.vendorService.findAll({
  //     skip: skip ? Number(skip) : undefined,
  //     take: take ? Number(take) : undefined,
  //     companyId,
  //     role,
  //     isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
  //   });
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get a vendor by id' })
  // @ApiResponse({ status: 200, description: 'Return the vendor.' })
  // @ApiResponse({ status: 404, description: 'Vendor not found.' })
  // async findOne(@Param('id') id: string) {
  //   return this.vendorService.findOne(id);
  // }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully updated.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: Prisma.VendorUpdateInput,
    @GetUser() user: User,
  ) {
    return this.vendorService.update(id, updateVendorDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    return this.vendorService.remove(id, user);
  }
}