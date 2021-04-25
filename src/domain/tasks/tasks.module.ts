import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRepository } from './repository/task.repository';
import { TasksController } from '../../api/controller/tasks/tasks.controller';
import { TasksService } from './service/tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskRepository])],
  controllers: [TasksController], // nest g controllert tasks로 생성한 컨트롤러가 주입됨
  providers: [TasksService],
})
export class TasksModule {}
