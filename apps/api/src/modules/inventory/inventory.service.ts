import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private movementRepository: Repository<StockMovement>,
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
  ) {}

  async findAll(branchId: string) {
    const items = await this.inventoryRepository.find({
      where: { branch_id: branchId },
      relations: { menu_item: true },
    });
    return items.map(item => ({
      ...item,
      is_low_stock: item.quantity_in_stock <= item.reorder_level,
    }));
  }

  async findOne(id: string, branchId: string) {
    const item = await this.inventoryRepository.findOne({
      where: { id, branch_id: branchId },
      relations: { menu_item: true },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return { ...item, is_low_stock: item.quantity_in_stock <= item.reorder_level };
  }

  async create(branchId: string, data: { menu_item_id: string; quantity_in_stock?: number; reorder_level?: number }) {
    const menuItem = await this.menuRepository.findOne({ where: { id: data.menu_item_id, branch_id: branchId } });
    if (!menuItem) throw new NotFoundException('Menu item not found in this branch');

    const existing = await this.inventoryRepository.findOne({
      where: { branch_id: branchId, menu_item_id: data.menu_item_id },
    });
    if (existing) throw new BadRequestException('Inventory item already exists for this menu item');

    const item = this.inventoryRepository.create({
      branch_id: branchId,
      menu_item_id: data.menu_item_id,
      quantity_in_stock: data.quantity_in_stock ?? 0,
      reorder_level: data.reorder_level ?? 10,
    });
    return this.inventoryRepository.save(item);
  }

  async update(id: string, branchId: string, data: { reorder_level?: number }) {
    const item = await this.findOne(id, branchId);
    if (data.reorder_level !== undefined) item.reorder_level = data.reorder_level;
    return this.inventoryRepository.save(item);
  }

  async remove(id: string, branchId: string) {
    const item = await this.inventoryRepository.findOne({ where: { id, branch_id: branchId } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return this.inventoryRepository.remove(item);
  }

  async addStock(id: string, branchId: string, data: { quantity: number; notes?: string }) {
    if (data.quantity <= 0) throw new BadRequestException('Quantity must be positive');

    const item = await this.findOne(id, branchId);
    item.quantity_in_stock += data.quantity;
    await this.inventoryRepository.save(item);

    const movement = this.movementRepository.create({
      branch_id: branchId,
      inventory_item_id: id,
      quantity_change: data.quantity,
      quantity_after: item.quantity_in_stock,
      movement_type: data.notes?.includes('wastage') ? 'wastage' : 'purchase',
      notes: data.notes,
    });
    await this.movementRepository.save(movement);

    return this.findOne(id, branchId);
  }

  async deductStockByTab(tab: { id: string; branch_id: string }, orders: { menu_item_id: string; quantity: number }[]) {
    for (const order of orders) {
      const inv = await this.inventoryRepository.findOne({
        where: { branch_id: tab.branch_id, menu_item_id: order.menu_item_id },
      });
      if (!inv) continue;

      const deducted = Math.min(inv.quantity_in_stock, order.quantity);
      inv.quantity_in_stock -= deducted;
      await this.inventoryRepository.save(inv);

      const movement = this.movementRepository.create({
        branch_id: tab.branch_id,
        inventory_item_id: inv.id,
        quantity_change: -deducted,
        quantity_after: inv.quantity_in_stock,
        movement_type: 'sale',
        reference_id: tab.id,
      });
      await this.movementRepository.save(movement);
    }
  }

  async getAlerts(branchId: string) {
    const items = await this.inventoryRepository.find({
      where: { branch_id: branchId, quantity_in_stock: LessThan('reorder_level' as any) },
      relations: { menu_item: true },
    });

    return items
      .filter(item => item.quantity_in_stock <= item.reorder_level)
      .map(item => ({
        id: item.id,
        menu_item_name: item.menu_item?.name || 'Unknown',
        quantity_in_stock: item.quantity_in_stock,
        reorder_level: item.reorder_level,
        deficit: item.reorder_level - item.quantity_in_stock,
      }));
  }

  async getStockVariance(branchId: string) {
    const items = await this.inventoryRepository.find({
      where: { branch_id: branchId },
      relations: { menu_item: true },
    });

    const result = [];
    for (const item of items) {
      const movements = await this.movementRepository.find({
        where: { branch_id: branchId, inventory_item_id: item.id },
        order: { created_at: 'DESC' },
      });

      const totalPurchased = movements.filter(m => m.movement_type === 'purchase').reduce((s, m) => s + m.quantity_change, 0);
      const totalSold = movements.filter(m => m.movement_type === 'sale').reduce((s, m) => s + Math.abs(m.quantity_change), 0);
      const totalWastage = movements.filter(m => m.movement_type === 'wastage').reduce((s, m) => s + m.quantity_change, 0);
      const expected = totalPurchased - totalSold - totalWastage;
      const variance = item.quantity_in_stock - expected;

      result.push({
        menu_item_name: item.menu_item?.name || 'Unknown',
        current_stock: item.quantity_in_stock,
        total_purchased: totalPurchased,
        total_sold: totalSold,
        total_wastage: totalWastage,
        expected_stock: expected,
        variance,
      });
    }

    return result;
  }

  async getMovements(inventoryItemId: string, branchId: string) {
    return this.movementRepository.find({
      where: { inventory_item_id: inventoryItemId, branch_id: branchId },
      order: { created_at: 'DESC' },
    });
  }
}
