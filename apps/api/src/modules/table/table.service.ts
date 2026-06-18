import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async create(createDto: any) {
    const table = this.tableRepository.create(createDto);
    return this.tableRepository.save(table);
  }

  async findAllByBranch(branchId: string) {
    return this.tableRepository.find({
      where: { branch_id: branchId },
    });
  }

  async findOne(id: string, branchId: string) {
    const table = await this.tableRepository.findOne({
      where: { id, branch_id: branchId },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async updateStatus(id: string, branchId: string, status: string) {
    const table = await this.findOne(id, branchId);
    table.status = status;
    return this.tableRepository.save(table);
  }

  async update(id: string, branchId: string, updateDto: any) {
    const table = await this.findOne(id, branchId);
    Object.assign(table, updateDto);
    return this.tableRepository.save(table);
  }
}
