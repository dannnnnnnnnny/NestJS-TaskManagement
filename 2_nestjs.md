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


#### 흐름
1. Client는 title과 description이 담긴 Body를 Post요청으로 localhost:3000/tasks 통해 보냄
2. 해당컨트롤러인 TasksController의 createTask()에서 요청을 처리하는데, @Body 데코레이터를 통해서 title, description을 받으면 TasksService.createTask()로 넘김
3. TasksService.createTask()에서 받은 title, description을 통해 새로운 task 인스턴스를 생성하고, tasks에 추가함. 새로 생성된 인스턴스를 반환하며 종료

---
## NestJS의 Provider
- Provider의 역할은 Controller 이외의 Service, Repository, Factory, Helper 등의 Dependency를 Nest Core가 Register할 수 있도록 등록하는 곳
- 이런 Dependency를 등록하기 위해서는 @Injectable이라는 데코레이터로 선언하여 사용

- 예를들어 Service.ts는 @Injectable 데코레이터를 통해서 싱글톤의 Dependency가 생기게 되는데 Controller에 존재했던 로직을 Service영역으로 책임과 역할을 수행하도록 로직을 옮김. 선언된 메소드들은 데이터를 조작하고 생성하고 조회하는 단순한 역할을 담당함.
- 이 @Injectable로 선언된 Dependency는 Nest Runtime 시 싱글톤 객체로 메모리상에 존재하게 됨
#### Controller에서 어떻게 사용되는지 ?
- controller.ts의 소스를 보면 생성자가 존재하고 생성자에는 해당 Service Argument를 받아서 Controller 내부의 멤버 변수에 주입하게 됨.
- 이 상황을 전문용어로 DI (Dependency Injection)이라고 말함

- 해당 Scope가 싱글톤이 기본이지만 의존성의 Scope를 통해 Life Cycle을 바꿀 수 있음
- 클라이언트의 요청이 있을 때마다 새로운 객체를 생성할 수 있는 모드도 존재
- 이 Scope는 REQUEST로 설정하여 사용 가능
- 하지만 성능을 위하여 DEFAULT인 싱글톤을 되도록 사용하도록 권고
```ts
import { Injectable, Scope } from '@nestjs/common';
// 요청마다 UserService는 새로운 객체를 생성하게 된다.
@Injectable({ scope: Scope.REQUEST })
export class UserService {
   ... 생략 ...
}
```
- 위와 같이 REQUEST로 설정되어 있는 경우 Controller 또한 변경해줘야 함
```ts
@Controller({
  path: 'user',
  scope: Scope.REQUEST,
})
export class UserController {
   ... 생략 ....
}
```

### IoC 개념 (Inversion of Control)
- 제어의 역전
- @Module에 등록된 각각의 의존성들을 관리하는 특정 컨테이너가 있고 이러한 의존성을 주입해야하는 상황에서 제어의 주도권을 IoC가 가지고 있어 다른 의존 객체에게 필요한 의존성을 주입하는 역할을 한다는 말
- 필요에 의해 의존성들을 관리해주는 역할
```ts
// IoC에 의해 의존성(Dependency) 주입이 되고 있음
 .... 생략 ....
constructor(private userService: UserService) {
  this.userService = userService;
} 
 .... 생략 ....
```