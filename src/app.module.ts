import { Module } from '@nestjs/common';
// import { TasksModule } from './tasks/tasks.module';
// import { AuthModule } from './auth/auth.module';
// import { ChatModule } from './chat/chat.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule],
})
export class AppModule {}
