import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import Bull, { Queue } from 'bull';
import { User } from 'src/auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  private logger = new Logger('TaskService');

  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
    @InjectQueue('task')
    private taskQueue: Queue,
    @Inject(REQUEST) private readonly request,
  ) {}

  async addTaskQueue(createTaskDto: CreateTaskDto, user: User): Promise<Bull.Job> {
    return await this.taskQueue.add(
      'taskQueue',
      { ...createTaskDto, userId: user.id, created: new Date(Date.now()).getTime() },
      { delay: 10000 },
    );
  }

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    this.logger.log(`${this.request.headers.host}, ${JSON.stringify(this.request.user)}, ${this.request.originalUrl}`);
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

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
