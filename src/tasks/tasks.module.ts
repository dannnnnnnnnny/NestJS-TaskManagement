import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController], // nest g controllert tasks로 생성한 컨트롤러가 주입됨
  providers: [TasksService],
})
export class TasksModule {}
