import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('tables')
@Index(['branch_id', 'table_number'], { unique: true })
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  branch_id: string;

  @Column()
  table_number: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: 1 })
  capacity: number;

  @Column({
    type: 'enum',
    enum: ['available', 'occupied', 'reserved'],
    default: 'available',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
