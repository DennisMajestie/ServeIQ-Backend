import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  branch_id: string;

  @Index()
  @Column({ type: 'uuid' })
  inventory_item_id: string;

  @Column({ type: 'integer' })
  quantity_change: number;

  @Column({ type: 'integer', default: 0 })
  quantity_after: number;

  @Column({
    type: 'enum',
    enum: ['purchase', 'sale', 'adjustment', 'wastage'],
  })
  movement_type: string;

  @Column({ type: 'uuid', nullable: true })
  reference_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
