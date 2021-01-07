## Task Model
- 클래스 or 인터페이스로 모델을 정의할 수 있음 (하지만 인터페이스는 컴파일 후 유지되지 않음 고로 클래스 사용)
- 확실하지 않을 경우 인터페이스로 먼저 생성해보는 것도 좋음
```ts

### Model
// tasks.model.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
```
---
### Service
```ts
// service
import { Injectable } from '@nestjs/common';
import { Task } from './tasks.model';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }
}
```
- tasks를 Task Array 모델 타입으로 정의, getAllTasks 메소드 반환 타입 정의

---
### Controller
```ts
import { Controller, Get } from '@nestjs/common';
import { Task } from './tasks.model';
import { TasksService } from './tasks.service';

// Controller 데코레이터 (어떤 경로를 처리해야하는지 알려줌)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks(): Task[] {
    return this.tasksService.getAllTasks();
  }
}
```
- getAllTasks 메소드 반환 타입 정의


### createTask 추가
#### TasksService
```ts
// Service
createTask(title: string, description: string): Task {
    const task: Task = {
      id: uuid.v1(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }
```
---
#### TasksController
```ts
// Controller
@Post()
  createTask(@Body() body) {
    console.log('body', body);
  }
```
- @Body 데코레이터를 통해서 요청받은 값을 객체로 얻을 수 있음.

##### Body key값을 개별적으로 지정하여 사용하기
```ts
// Controller
@Post()
  createTask(
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    console.log(title, description);
  }
```

```ts
@Post()
  createTask(
    @Body('title') title: string,
    @Body('description') description: string,
  ): Task {
    return this.tasksService.createTask(title, description);
  }
```
- tasksService의 createTask에 body 데코레이터로 받은 title, description을 넘겨주어 새로운 task를 생성 후 반환
