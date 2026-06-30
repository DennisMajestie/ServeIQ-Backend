import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Order } from '../order/entities/order.entity';
import { Tab } from '../tab/entities/tab.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private movementRepository: Repository<StockMovement>,
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
  ) {}

  async findAll(branchId: string) {
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.menu_item', 'menu_item')
      .where('item.branch_id = :branchId', { branchId })
      .getMany();
    return items.map(item => ({
      ...item,
      is_low_stock: item.quantity_in_stock <= item.reorder_level,
    }));
  }

  async findOne(id: string, branchId: string) {
    const item = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.menu_item', 'menu_item')
      .where('item.id = :id AND item.branch_id = :branchId', { id, branchId })
      .getOne();
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
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.menu_item', 'menu_item')
      .where('item.branch_id = :branchId', { branchId })
      .andWhere('item.quantity_in_stock <= item.reorder_level')
      .getMany();

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
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.menu_item', 'menu_item')
      .where('item.branch_id = :branchId', { branchId })
      .getMany();

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

  async getBestsellers(branchId: string, dateFrom?: string, dateTo?: string) {
    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().setHours(0, 0, 0, 0));
    const to = dateTo ? new Date(dateTo) : new Date(new Date().setHours(23, 59, 59, 999));
    if (!dateFrom) from.setHours(0, 0, 0, 0);

    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.menu_item', 'menu_item')
      .where('item.branch_id = :branchId', { branchId })
      .getMany();

    const paidTabs = await this.tabRepository.find({
      where: { branch_id: branchId, status: 'paid', closed_at: Between(from, to) },
    });
    const tabIds = paidTabs.map(t => t.id);

    const orderMap: Record<string, { qty: number; revenue: number }> = {};
    if (tabIds.length > 0) {
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.tab_id IN (:...tabIds)', { tabIds })
        .getMany();

      for (const order of orders) {
        if (!orderMap[order.menu_item_id]) {
          orderMap[order.menu_item_id] = { qty: 0, revenue: 0 };
        }
        orderMap[order.menu_item_id].qty += order.quantity;
        orderMap[order.menu_item_id].revenue += order.subtotal_kobo;
      }
    }

    const result = items
      .map(item => {
        const sales = orderMap[item.menu_item_id] || { qty: 0, revenue: 0 };
        const turnoverDays = item.quantity_in_stock > 0 && sales.qty > 0
          ? Math.round((item.quantity_in_stock / sales.qty) * 30)
          : null;

        return {
          inventory_item_id: item.id,
          menu_item_id: item.menu_item_id,
          menu_item_name: item.menu_item?.name || 'Unknown',
          category: item.menu_item?.category || 'Unknown',
          current_stock: item.quantity_in_stock,
          reorder_level: item.reorder_level,
          is_low_stock: item.quantity_in_stock <= item.reorder_level,
          total_sold: sales.qty,
          revenue_kobo: sales.revenue,
          estimated_days_until_out: turnoverDays,
        };
      })
      .sort((a, b) => b.total_sold - a.total_sold);

    return {
      bestsellers: result.filter(r => r.total_sold > 0),
      slow_movers: result.filter(r => r.total_sold === 0 && r.current_stock > 0),
      out_of_stock: result.filter(r => r.current_stock === 0),
    };
  }
}
