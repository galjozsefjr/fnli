import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsStrongPasswordOptions,
  ValidationArguments,
  validateOrReject,
} from 'class-validator';
import type { UpdateUserData } from '@fnli/types/user';
import { Match } from '../decorators/match.decorator';
import { TrimmedText } from '../decorators/transform.trimmed-text';

const PASSWORD_REQUIREMENTS: IsStrongPasswordOptions = {
  minLength: 8,
  minLowercase: 1,
  minNumbers: 1,
  minUppercase: 0,
  minSymbols: 0,
};

const PasswordValidationMessage = ({
  constraints: [{ minLength, minLowercase, minNumbers }],
}: ValidationArguments) => `The password must be at least ${minLength} characters, containing at least ${minNumbers} number and ${minLowercase} lower case letter`;

export class LoginRequest {
  @Transform(({ value }) => (value ? `${value}`.trim().toLowerCase() : ''))
  @ApiProperty({ type: String, description: 'Username (email address)', example: 'admin@local.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  username: string;

  @ApiProperty({ type: String, description: 'The password must be at least 8 characters, containing at least 1 number and 1 lower case letter', example: 'admin123' })
  @IsString()
  @IsStrongPassword(PASSWORD_REQUIREMENTS, { message: PasswordValidationMessage })
  password: string;
}

export class LoginResponse {
  @ApiProperty({ type: String, description: 'JWT Bearer token' })
  accessToken: string;
}

export class RegisterUserRequestBody
  extends LoginRequest
  implements UpdateUserData {
  @ApiProperty({ type: String, description: 'First name', example: '' })
  @TrimmedText()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ type: String, description: 'Last name', example: '' })
  @TrimmedText()
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class RegisterUserResponse extends PickType(RegisterUserRequestBody, ['firstName', 'lastName'] as const) {
  @ApiProperty({ type: String, description: 'User identifier', example: 'c3621d67-c304-41ad-b965-907f74d46bf2' })
  userId: string;
}

export const validateLoginRequest = async (
  username: string,
  password: string,
) => {
  const login = new LoginRequest();
  login.username = username;
  login.password = password;
  return validateOrReject(login);
};

export class ChangePasswordBody {
  @ApiProperty({ type: String, description: 'The password must be at least 8 characters, containing at least 1 number and 1 lower case letter', example: 'admin123' })
  @IsString()
  @IsStrongPassword(PASSWORD_REQUIREMENTS, { message: PasswordValidationMessage })
  oldPassword: string;

  @ApiProperty({ type: String, description: 'The password must be at least 8 characters, containing at least 1 number and 1 lower case letter', example: 'admin321' })
  @IsString()
  @IsStrongPassword(PASSWORD_REQUIREMENTS, { message: PasswordValidationMessage })
  password: string;

  @ApiProperty({
    type: String,
    description: 'Confirm new password',
    example: '',
  })
  @IsString()
  @Match('password', { message: 'Different passwords' })
  passwordConfirm: string;
}

export class UpdateUserDataBody implements UpdateUserData {
  @ApiProperty({ type: String, description: 'First name', example: 'Hyper' })
  @TrimmedText()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ type: String, description: 'Last name', example: 'Admin' })
  @TrimmedText()
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
