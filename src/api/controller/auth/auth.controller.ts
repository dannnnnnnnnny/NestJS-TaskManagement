import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  // UseGuards,
  ValidationPipe,
} from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../../domain/auth/service/auth.service';
import { AuthCredentialsDto } from '../../../domain/auth/dto/auth-credentials.dto';
// import { GetUser } from './get-user.decorator';
// import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Get('/filtering')
  filtering(@Query('filter') filter: string, @Query('type') type: string) {
    return this.authService.authFilter(filter, type);
  }
}
