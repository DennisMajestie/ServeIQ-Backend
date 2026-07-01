import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { PosTerminal } from './entities/pos-terminal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PosTerminal])],
  providers: [PosService],
  controllers: [PosController],
  exports: [PosService],
})
export class PosModule {}
