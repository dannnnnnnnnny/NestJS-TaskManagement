import { InjectQueue } from '@nestjs/bull';
import { HttpService, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Logger as PinoLogger } from 'nestjs-pino';
import { User } from 'src/domain/entities/user.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { TaskStatus } from '../dto/task-status.enum';
import { Task } from '../../entities/task.entity';
import { TaskRepository } from '../repository/task.repository';

@Injectable()
export class TasksService {
  private logger = new Logger('TaskService');

  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
    @InjectQueue('task')
    private taskQueue: Queue,
    @Inject(REQUEST) private readonly request,
    private readonly httpService: HttpService,
    private readonly pinoLogger: PinoLogger,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User) {
    this.logger.log(`${this.request.headers.host}, ${JSON.stringify(this.request.user)}, ${this.request.originalUrl}`);
    const headerRequest = {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer TEST',
    };

    const data = await this.httpService
      .post(
        'http://localhost:3000/tasks/queue',
        {
          title: 'haha',
          description: 'test',
        },
        {
          headers: headerRequest,
        },
      )
      .toPromise();

    this.pinoLogger.log(data.data);
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!found) {
      throw new NotFoundException(`Task With ID "${id}" not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id });
    if (!result.affected) {
      throw new NotFoundException(`Task With ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
