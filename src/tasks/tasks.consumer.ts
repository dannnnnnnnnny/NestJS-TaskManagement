import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('task')
export class TasksConsumer {
  private logger = new Logger('TasksConsumer');

  @Process('taskQueue')
  handleTranscode(job: Job) {
    this.logger.verbose('Start transcoding...');
    this.logger.verbose(job.data);
    this.logger.verbose('Transcoding completed');
  }
}