import { IsEmail, IsString, IsOptional } from "class-validator";

export class AuthRequestDTO {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

export class EditAccountDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  role?: string;
}
