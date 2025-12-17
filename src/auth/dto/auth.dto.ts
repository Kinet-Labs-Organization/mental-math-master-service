import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UserAuthDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserSignupDTO {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  password!: string;

  @IsString()
  name!: string;
}

export class AccessTokenDto {
  email: string;
  subscribedOn?: Date | null;
  subscriptionExpiration?: Date | null;
  term?: string | null;
  status: string;
}
