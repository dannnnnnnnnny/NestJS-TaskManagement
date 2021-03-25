import { BullModule } from '@nestjs/bull';
import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { TaskRepository } from './task.repository';
import { TasksConsumer } from './tasks.consumer';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskRepository]),
    AuthModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'task',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [TasksController], // nest g controllert tasks로 생성한 컨트롤러가 주입됨
  providers: [TasksService, TasksConsumer],
})
export class TasksModule {}
