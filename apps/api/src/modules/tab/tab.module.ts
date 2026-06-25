import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TabService } from './tab.service';
import { TabController } from './tab.controller';
import { Tab } from './entities/tab.entity';
import { Table } from '../table/entities/table.entity';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tab, Table, User, Order])],
  providers: [TabService],
  controllers: [TabController],
  exports: [TabService],
})
export class TabModule {}
