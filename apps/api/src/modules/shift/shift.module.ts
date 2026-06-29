import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { Shift } from './entities/shift.entity';
import { Bill } from '../bill/entities/bill.entity';
import { Tab } from '../tab/entities/tab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, Bill, Tab])],
  providers: [ShiftService],
  controllers: [ShiftController],
  exports: [ShiftService],
})
export class ShiftModule {}
