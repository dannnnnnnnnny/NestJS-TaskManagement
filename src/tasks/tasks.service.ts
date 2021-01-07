import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './tasks.model';
import * as uuid from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskById(id: string): Task {
    return this.tasks.find((task) => task.id === id);
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;

    const task: Task = {
      id: uuid.v4(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  deleteTask(id: string): void {
    // 내가 한 방법
    // const taskToFind = this.tasks.find((item) => item.id === id);
    // const idx = this.tasks.indexOf(taskToFind);
    // if (idx > -1) {
    //   this.tasks.splice(idx, 1);
    // }

    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}
