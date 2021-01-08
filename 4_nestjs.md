## id를 이용한 task 조회 (GET)

#### tasksService
```ts
getTaskById(id: string): Task {
  return this.tasks.find((task) => task.id === id);
}
```

#### tasksController
```ts
@Get('/:id') // GET /tasks/1
getTaskById(@Param('id') id: string): Task {
  return this.tasksService.getTaskById(id);
}
```
- @Param 데코레이터를 통해서 @Get 데코레이터에서 지정한 id 파라미터를 가져온 후 Service의 getTaskById 메소드로 넘겨줌

--- 
## task 삭제 (DELETE)
- DELETE HTTP 요청
- URL에 삭제할 작업의 ID 포함
- ID를 추출하고 task 삭제

#### tasksService
```ts
deleteTask(id: string): void {
  // 내가 한 방법
  // const taskToFind = this.tasks.find((item) => item.id === id);
  // const idx = this.tasks.indexOf(taskToFind);
  // if (idx > -1) {
  //   this.tasks.splice(idx, 1);
  // }

  this.tasks = this.tasks.filter((task) => task.id !== id);
}
```

#### tasksController
```ts
@Delete('/:id')
deleteTask(@Param('id') id: string): void {
  this.tasksService.deleteTask(id);
}
```

## Status 업데이트
- PATCH HTTP 요청 수신
- 삭제할 작업 ID와 업데이트할 body 데이터
- ID와 status 추출 후, 업데이트하고 클라이언트에 반환

#### PATCH http://localhost:3000/tasks/1/status
- PATCH, 변경할 특정 아이템 ID, 업데이트할 항목명
#### Controller
```ts
@Patch('/:id/status')
patchTask(@Param('id') id: string, @Body('status') status: TaskStatus): Task {
  return this.tasksService.updateTaskStatus(id, status);
}
```
- Param을 통해 바꿀 task의 id를 받음
- Body { status : } 로 변경할 status 내용을 받음 (enum 타입에 맞춰서)
#### Service
```ts
updateTaskStatus(id: string, status: TaskStatus): Task {
  const task = this.getTaskById(id);
  task.status = status;
  return task;
}
```
- 요청받은 id를 이미 이전에 만들어놓은 getTaskById() 메소드를 통해서 조회 후 해당 task의 status 업데이트

---
## Filter & Search
#### DTO
```ts
import { TaskStatus } from '../tasks.model';

export class GetTasksFilterDto {
  status: TaskStatus;
  search: string;
}
```

#### Service
```ts
getTaskWithFilters(filterDto: GetTasksFilterDto): Task[] {
  const { status, search } = filterDto;
  let tasks = this.getAllTasks();
  if (status) {
    tasks = tasks.filter((task) => task.status === status);
  }

  if (search) {
    tasks = tasks.filter(
      (task) =>
        task.title.includes(search) || task.description.includes(search),
    );
  }
  return tasks;
}
```
- 기존 getAllTasks() 메소드로 모든 task 조회
- status 데이터가 있으면 해당하는 task 필터
- search 데이터가 있으면 title과 description에 includes를 통해 해당 값을 가지고 있는지 필터

#### Controller
```ts
@Get() // GET /tasks or /tasks?status=OPEN&search=hello
getTasks(@Query() filterDto: GetTasksFilterDto): Task[] {
  if (Object.keys(filterDto).length) {
    return this.tasksService.getTaskWithFilters(filterDto);
  } else {
    return this.tasksService.getAllTasks();
  }
}
```
- 기존 Controller의 getAllTasks() 메소드를 수정함
- QueryString이 존재하는지 체크
- 있으면 getTaskWithFilters() 메소드로 쿼리스트링까지 보냄
- 없다면 기존대로 getAllTasks() 메소드로 전체 Tasks 조회
