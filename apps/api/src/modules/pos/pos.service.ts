import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PosTerminal } from './entities/pos-terminal.entity';
import { CreatePosTerminalDto } from './dto/create-pos-terminal.dto';
import { UpdatePosTerminalDto } from './dto/update-pos-terminal.dto';

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(PosTerminal)
    private posTerminalRepository: Repository<PosTerminal>,
  ) {}

  async create(branchId: string, dto: CreatePosTerminalDto) {
    const terminal = this.posTerminalRepository.create({
      ...dto,
      branch_id: branchId,
    });
    return this.posTerminalRepository.save(terminal);
  }

  async findAllByBranch(branchId: string) {
    return this.posTerminalRepository.find({
      where: { branch_id: branchId },
      order: { label: 'ASC' },
    });
  }

  async findActiveByBranch(branchId: string) {
    return this.posTerminalRepository.find({
      where: { branch_id: branchId, is_active: true },
      order: { label: 'ASC' },
    });
  }

  async findOne(id: string, branchId: string) {
    const terminal = await this.posTerminalRepository.findOne({
      where: { id, branch_id: branchId },
    });
    if (!terminal) {
      throw new NotFoundException('POS terminal not found');
    }
    return terminal;
  }

  async update(id: string, branchId: string, dto: UpdatePosTerminalDto) {
    const terminal = await this.findOne(id, branchId);
    Object.assign(terminal, dto);
    return this.posTerminalRepository.save(terminal);
  }

  async remove(id: string, branchId: string) {
    const terminal = await this.findOne(id, branchId);
    return this.posTerminalRepository.remove(terminal);
  }
}
