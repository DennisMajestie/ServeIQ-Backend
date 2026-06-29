import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Order } from '../order/entities/order.entity';
import { Tab } from '../tab/entities/tab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, StockMovement, MenuItem, Order, Tab])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
