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
} from '@nestjs/common';
import { Prisma, Vendor } from '@prisma/client';
import { VendorService } from './vendor.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '@/src/auth/decorator';
import { JwtGuard } from '@/src/auth/guard';
import { AccessTokenUserDto, StaffSignupDto } from '@/src/auth/dto';

@ApiTags('Vendors')
@UseGuards(JwtGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @Get('me')
  async me(@GetUser() user: AccessTokenUserDto) {
    return user;
  }

  /**
   * Not needed because, the vendor along with vendor owner is created during signup process in Auth module
   * 
   * @Post()
   * @ApiOperation({ summary: 'Create a new vendor' })
   * @ApiResponse({ status: 201, description: 'Vendor successfully created.' })
   * async createVendor(@Body() vendorCreateInput: Prisma.VendorCreateInput, @Body() vendorUserCreateInput: Omit<Prisma.VendorUserCreateInput, 'vendor'>) {
   * return this.vendorService.createVendorAndVendorOwner(vendorCreateInput, vendorUserCreateInput);
   * }
   * */

  // @Post('staff')
  // @ApiOperation({ summary: 'Create a new vendor staff' })
  // @ApiResponse({ status: 201, description: 'Vendor staff successfully created.' })
  // async createVendorStaff(@Body() createVendorDto: Prisma.VendorCreateInput, @GetUser() vendor: Vendor) {
  //   return this.vendorService.createStaff(createVendorDto, vendor);
  // }

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

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a vendor' })
  // @ApiResponse({ status: 200, description: 'Vendor successfully updated.' })
  // @ApiResponse({ status: 404, description: 'Vendor not found.' })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateVendorDto: Prisma.VendorUpdateInput,
  //   @GetUser() vendor: Vendor,
  // ) {
  //   return this.vendorService.update(id, updateVendorDto, vendor);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete a vendor' })
  // @ApiResponse({ status: 200, description: 'Vendor successfully deleted.' })
  // @ApiResponse({ status: 404, description: 'Vendor not found.' })
  // async remove(@Param('id') id: string, @GetUser() vendor: Vendor) {
  //   return this.vendorService.remove(id, vendor);
  // }
}