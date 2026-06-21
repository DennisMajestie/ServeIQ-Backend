import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Branch } from '../branch/entities/branch.entity';
import { UserRole } from '../../common/shared';
import { CreateWaiterDto } from './dto/create-waiter.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createDto: any) {
    const user = this.userRepository.create(createDto);
    return this.userRepository.save(user);
  }

  async createWaiter(dto: CreateWaiterDto, businessId: string): Promise<{ waiter: Partial<User>; pin: string }> {
    try {
      // 1. Validate branch exists and belongs to this business
      const branch = await this.branchRepository.findOne({
        where: { id: dto.branchId, business_id: businessId },
      });
      if (!branch) {
        throw new NotFoundException(`Branch not found or does not belong to your business`);
      }

      // 2. Generate a unique 4-digit PIN for this business
      let pin = '';
      let pinIsUnique = false;
      let attempts = 0;

      while (!pinIsUnique && attempts < 10) {
        attempts++;
        pin = String(Math.floor(1000 + Math.random() * 9000));
        const existing = await this.userRepository.find({
          where: { business_id: businessId, role: UserRole.WAITER, is_active: true },
        });
        const pinTaken = await Promise.all(
          existing.map((w) => (w.pin_hash ? bcrypt.compare(pin, w.pin_hash) : Promise.resolve(false))),
        );
        pinIsUnique = !pinTaken.some(Boolean);
      }

      const salt = await bcrypt.genSalt();
      const pinHash = await bcrypt.hash(pin, salt);

      // Waiters don't always have email — generate a placeholder if not supplied
      const email = dto.email ?? `waiter-${Date.now()}-${Math.floor(Math.random() * 1000)}@internal.serveiq`;

      // Generate a random secure password (waiter logs in via PIN, not password)
      const randomPassword = await bcrypt.hash(Math.random().toString(36), salt);

      const user = this.userRepository.create({
        business_id: businessId,
        branch_id: dto.branchId,
        full_name: dto.fullName,
        email,
        phone: dto.phone,
        password_hash: randomPassword,
        pin_hash: pinHash,
        role: UserRole.WAITER,
        is_active: true,
      });

      const savedUser = await this.userRepository.save(user);

      return {
        waiter: {
          id: savedUser.id,
          full_name: savedUser.full_name,
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role,
          branch_id: savedUser.branch_id,
        },
        pin, // Plain PIN — shown once to admin
      };
    } catch (err) {
      console.error('[UserService] Error creating waiter:', err);
      throw err;
    }
  }

  async findAllWaiters(branchId: string) {
    return this.userRepository.find({
      where: { branch_id: branchId, role: UserRole.WAITER },
      select: { id: true, full_name: true, email: true, phone: true, is_active: true, created_at: true },
    });
  }

  async resetWaiterPin(waiterId: string, businessId: string): Promise<{ pin: string }> {
    const waiter = await this.userRepository.findOne({
      where: { id: waiterId, business_id: businessId, role: UserRole.WAITER },
    });
    if (!waiter) throw new NotFoundException('Waiter not found');

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const salt = await bcrypt.genSalt();
    waiter.pin_hash = await bcrypt.hash(pin, salt);
    await this.userRepository.save(waiter);

    return { pin };
  }

  async findAllByBranch(branchId: string) {
    return this.userRepository.find({ where: { branch_id: branchId } });
  }

  async findOne(id: string, branchId: string) {
    const user = await this.userRepository.findOne({ where: { id, branch_id: branchId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: { business: true, branch: true },
    });
  }

  async update(id: string, branchId: string, updateDto: any) {
    const user = await this.findOne(id, branchId);
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }
}
