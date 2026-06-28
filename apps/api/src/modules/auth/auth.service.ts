import { Inject, Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DataSource, MoreThan } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Branch } from '../branch/entities/branch.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { WaiterLoginDto } from './dto/waiter-login.dto';
import { UserRole } from '../../common/shared';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Business
      const business = queryRunner.manager.create(Business, {
        name: dto.businessName,
        slug: dto.businessName.toLowerCase().replace(/ /g, '-'),
        type: dto.businessType,
        owner_id: 'pending',
        email: dto.email,
        logo_url: dto.logoUrl ?? null,
        cac_document_url: dto.cacDocumentUrl ?? null,
      } as Partial<Business>);
      const savedBusiness = await queryRunner.manager.save(business);

      // 2. Create Default Branch
      const branch = queryRunner.manager.create(Branch, {
        business_id: savedBusiness.id,
        name: 'Main Branch',
        is_active: true,
      });
      const savedBranch = await queryRunner.manager.save(branch);

      // 3. Create Owner User
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const user = queryRunner.manager.create(User, {
        business_id: savedBusiness.id,
        branch_id: savedBranch.id,
        full_name: dto.fullName,
        email: dto.email,
        password_hash: passwordHash,
        role: UserRole.OWNER,
        is_active: true,
      });
      const savedUser = await queryRunner.manager.save(user);

      // 4. Update Business with Owner ID
      savedBusiness.owner_id = savedUser.id;
      await queryRunner.manager.save(savedBusiness);

      await queryRunner.commitTransaction();

      return this.generateTokens(savedUser);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: dto.email },
      relations: { business: true, branch: true },
    });

    if (user && (await bcrypt.compare(dto.password, user.password_hash))) {
      return this.generateTokens(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async waiterLogin(dto: WaiterLoginDto) {
    if (!dto.pin) {
      throw new BadRequestException('PIN or passcode is required');
    }

    const whereClause: any = {
      role: UserRole.WAITER,
      is_active: true,
    };

    if (dto.branchId && dto.branchId.length === 36) {
      whereClause.branch_id = dto.branchId;
    }

    const waiters = await this.dataSource.getRepository(User).find({
      where: whereClause,
    });

    for (const waiter of waiters) {
      if (waiter.pin_hash && (await bcrypt.compare(dto.pin, waiter.pin_hash))) {
        return this.generateTokens(waiter);
      }
    }

    throw new UnauthorizedException('Invalid PIN');
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const repo = this.dataSource.getRepository(RefreshToken);
    const token = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const refreshToken = repo.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await repo.save(refreshToken);

    return token;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id,
      branchId: user.branch_id,
    };

    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        business: user.business_id,
        branch: user.branch_id,
      },
    };
  }

  async refreshToken(refreshTokenStr: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    const repo = this.dataSource.getRepository(RefreshToken);

    const stored = await repo.findOne({
      where: {
        token_hash: tokenHash,
        is_revoked: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.dataSource.getRepository(User).findOne({ where: { id: stored.user_id } });
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    stored.is_revoked = true;
    await repo.save(stored);

    return this.generateTokens(user);
  }

  async logout(refreshTokenStr: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
    const repo = this.dataSource.getRepository(RefreshToken);

    await repo.update({ token_hash: tokenHash }, { is_revoked: true });
    return { message: 'Logged out successfully' };
  }
}
