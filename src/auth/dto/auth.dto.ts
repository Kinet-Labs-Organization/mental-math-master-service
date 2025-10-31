import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class VendorOwnerAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StaffAuthDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class VendorWithOwnerSignupDto {
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userFullName: string;

  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @IsString()
  @IsOptional()
  userPhone: string;
}

export class StaffSignupDto {
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @IsString()
  @IsNotEmpty()
  userFullName: string;

  @IsString()
  @IsNotEmpty()
  userPhone: string;
}

export class AccessTokenUserDto {
  vendorUUID: string;
  vendorId: string;
  userUUID: string;
  userEmail: string;
  userRole: string;
}