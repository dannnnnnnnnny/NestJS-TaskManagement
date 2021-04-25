import { User } from './user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../tasks/dto/task-status.enum';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn() // 새 task 만들 시, 자동으로 생성
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @ManyToOne((type) => User, (user) => user.tasks, { eager: false })
  user: User;

  @Column()
  userId: number;
}
