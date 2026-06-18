import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { WaiterLoginDto } from './dto/waiter-login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new business and owner',
    description:
      'Creates a new business account with the owner user. Upload logo/CAC first via POST /api/upload and pass the returned URLs here.',
  })
  @ApiResponse({ status: 201, description: 'Business and owner successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation error — check the request body.' })
  @ApiResponse({ status: 409, description: 'Email already registered.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in with email and password',
    description:
      'Authenticates a user and returns a JWT access token. Use the token in the Authorize button (🔒) above to test protected endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful — JWT access token returned.',
    schema: {
      example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('waiter-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Waiter PIN login',
    description:
      'Authenticates a waiter using their 4-digit PIN and branch ID. Returns a JWT scoped to the WAITER role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Waiter authenticated — JWT access token returned.',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid PIN.' })
  async waiterLogin(@Body() waiterLoginDto: WaiterLoginDto) {
    return this.authService.waiterLogin(waiterLoginDto);
  }
}
